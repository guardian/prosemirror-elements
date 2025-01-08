import { DOMSerializer } from "prosemirror-model";
import type { Node } from "prosemirror-model";
import type { EditorState } from "prosemirror-state";
import { NodeSelection, Plugin } from "prosemirror-state";
import type { EditorProps } from "prosemirror-view";
import type { SendTelemetryEvent } from "../elements/helpers/types/TelemetryEvents";
import type {
  ElementSpec,
  ElementSpecMap,
  Field,
  FieldDescriptions,
} from "../plugin/types/Element";
import {
  getFieldsFromNode,
  updateFieldsFromNode,
  updateFieldViewsFromNode,
} from "./field";
import type { FieldView } from "./fieldViews/FieldView";
import { pluginKey } from "./helpers/constants";
import type {
  GetElementDataFromNode,
  TransformElementOut,
} from "./helpers/element";
import { getFieldValuesFromNode } from "./helpers/element";
import type { Commands, Predicate } from "./helpers/prosemirror";
import {
  buildCommands,
  createUpdateDecorations,
  getValidElementInsertionRange,
  selectionHasChangedForRange,
} from "./helpers/prosemirror";
import {
  elementSelectedNodeAttr,
  getNodeNameFromElementName,
  isProseMirrorElement,
  isProseMirrorElementSelected,
} from "./nodeSpec";

const decorations = createUpdateDecorations();

export type PluginState = {
  validInsertionRange: { from: number; to: number } | undefined;
};

const selectionIsZeroWidth = (state: EditorState) =>
  state.selection.from === state.selection.to;

export const createPlugin = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpecMap, string>,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames>
>(
  elementsSpec: {
    [elementName in ElementNames]: ElementSpec<FDesc>;
  },
  sendTelemetryEvent: SendTelemetryEvent,
  getElementDataFromNode: GetElementDataFromNode<ElementNames, ESpecMap>,
  predicate: Predicate,
  transformElementOut?: TransformElementOut
): Plugin<PluginState> => {
  const commands = buildCommands(predicate);
  return new Plugin<PluginState>({
    key: pluginKey,
    state: {
      init(_, state) {
        const validInsertionRange = getValidElementInsertionRange(
          state.doc,
          predicate
        );

        return {
          validInsertionRange,
        };
      },
      apply(_, __, ___, newState) {
        const validInsertionRange = getValidElementInsertionRange(
          newState.doc,
          predicate
        );

        return {
          validInsertionRange,
        };
      },
    },
    /**
     * Update the elements to represent the current selection.
     */
    appendTransaction: (_, oldState, newState) => {
      // If we are not transitioning between at least one selection of non-zero
      // width, we cannot be altering the element selection state.
      if (selectionIsZeroWidth(oldState) && selectionIsZeroWidth(newState)) {
        return;
      }

      const tr = newState.tr;
      const selection = tr.selection;
      const elementNodeToPos = new Map<Node, number>();
      let preserveNodeSelection = false;

      // Find all the nodes within the current selection.
      newState.doc.nodesBetween(
        newState.selection.from,
        newState.selection.to,
        (node, pos) => {
          if (
            isProseMirrorElement(node) &&
            newState.selection.from <= pos &&
            newState.selection.to >= pos + node.nodeSize
          ) {
            elementNodeToPos.set(node, pos);
            return false;
          }
        }
      );

      // Update every relevant node with the new selection state.
      newState.doc.descendants((node, pos) => {
        const isCurrentlySelected = elementNodeToPos.get(node) !== undefined;
        const shouldUpdateNode =
          (isProseMirrorElementSelected(node) && !isCurrentlySelected) ||
          (!isProseMirrorElementSelected(node) && isCurrentlySelected);

        if (shouldUpdateNode) {
          preserveNodeSelection = true;
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            [elementSelectedNodeAttr]: isCurrentlySelected,
          });
        }

        // Do not descend into element nodes.
        if (isProseMirrorElement(node)) {
          return false;
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's not always falsy.
      if (preserveNodeSelection && selection instanceof NodeSelection) {
        tr.setSelection(NodeSelection.create(tr.doc, selection.anchor));
      }

      return tr;
    },
    props: {
      decorations,
      nodeViews: createNodeViews(
        elementsSpec as ElementSpecMap<FDesc, ElementNames>,
        commands,
        sendTelemetryEvent,
        getElementDataFromNode,
        transformElementOut
      ),
      // Are we in an element? If so, mark scroll to selection as handled – or
      // the parent editor will scroll to the top of the node containing the
      // nested element.
      handleScrollToSelection(view) {
        const selection = view.state.selection;

        let isWithinElement = false;
        view.state.doc.nodesBetween(selection.from, selection.to, (node) => {
          if (isProseMirrorElement(node)) {
            isWithinElement = true;
          }
        });

        return isWithinElement;
      },
    },
  });
};

type NodeViewSpec = NonNullable<EditorProps["nodeViews"]>;

const createNodeViews = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpecMap, string>,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames>
>(
  elementsSpec: ElementSpecMap<FDesc, ElementNames>,
  commands: Commands,
  sendTelemetryEvent: SendTelemetryEvent,
  getElementDataFromNode: GetElementDataFromNode<ElementNames, ESpecMap>,
  transformElementOut?: TransformElementOut
): NodeViewSpec => {
  const nodeViews = {} as NodeViewSpec;
  for (const elementName in elementsSpec) {
    const nodeName = getNodeNameFromElementName(elementName);
    nodeViews[nodeName] = createNodeView(
      nodeName,
      elementsSpec[elementName],
      commands,
      sendTelemetryEvent,
      getElementDataFromNode,
      transformElementOut
    );
  }

  return nodeViews;
};

type NodeViewCreator = NodeViewSpec[keyof NodeViewSpec];

const createNodeView = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpecMap, string>,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames>,
  NodeName extends string
>(
  nodeName: NodeName,
  element: ElementSpec<FDesc>,
  commands: Commands,
  sendTelemetryEvent: SendTelemetryEvent,
  getElementDataFromNode: GetElementDataFromNode<ElementNames, ESpecMap>,
  transformElementOut?: TransformElementOut
): NodeViewCreator => (initElementNode, view, _getPos, _, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const getPos = () => _getPos() ?? NaN;

  const serializer = DOMSerializer.fromSchema(initElementNode.type.schema);
  const initCommands = commands(getPos, view);

  const fields = getFieldsFromNode({
    node: initElementNode,
    fieldDescriptions: element.fieldDescriptions,
    view,
    getPos,
    innerDecos,
    serializer,
    getElementDataFromNode,
    transformElementOut,
  });

  // Because nodes and decorations are immutable in ProseMirror, we can compare
  // current nodes to new nodes to determine whether node content has changed.
  // We therefore cache the current node and field values here to enable this
  // comparison, allowing us to make some optimisations:
  //   - we only recalculate field values when the node has changed.
  //   - we preserve the object identity of our field values when they remain
  //     the same, enabling renderers downstream to avoid rerendering when field
  //     values have not changed by comparing the object identities of current
  //     and new fieldValue objects.
  //   - we only update FieldViews when the node or its decorations have
  //     changed.
  //   - we only update consumers when the fieldValues, decorations or command
  //     values have changed.
  let currentNode = initElementNode;
  let currentFields = fields;
  let currentDecos = innerDecos;
  let currentIsSelected = false;
  const pluginState = pluginKey.getState(view.state);
  let currentCommandValues = getCommandValues(getPos(), pluginState?.validInsertionRange);
  let currentSelection = view.state.selection;
  let currentStoredMarks = view.state.storedMarks;

  const getElementDataForUpdator = () =>
    getFieldValuesFromNode(
      currentNode,
      element.fieldDescriptions,
      serializer,
      getElementDataFromNode,
      transformElementOut
    );

  const update = element.createUpdator(
    dom,
    fields,
    (fields) => {
      view.dispatch(
        view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...initElementNode.attrs,
          fields,
        })
      );
    },
    initCommands,
    sendTelemetryEvent,
    getElementDataForUpdator
  );

  return {
    dom,
    update: (newNode, _, innerDecos) => {
      if (
        newNode.type.name === nodeName &&
        newNode.attrs.type === initElementNode.attrs.type
      ) {
        const pos = getPos();
        const newIsSelected = isProseMirrorElementSelected(newNode);

        const newCommands = commands(getPos, view);
        const pluginState = pluginKey.getState(view.state);
        const newCommandValues = getCommandValues(getPos(), pluginState?.validInsertionRange);

        const newSelection = view.state.selection;
        const newStoredMarks = view.state.storedMarks;

        const isSelectedChanged = currentIsSelected !== newIsSelected;
        const innerDecosChanged = currentDecos !== innerDecos;
        const fieldValuesChanged = fieldValuesHaveChanged(currentNode, newNode);
        const commandsChanged = commandsHaveChanged(
          currentCommandValues,
          newCommandValues
        );
        const selectionChangeAffectsNode = selectionHasChangedForRange(
          pos,
          pos + newNode.nodeSize,
          currentSelection,
          newSelection
        );
        const storedMarksHaveChanged = currentStoredMarks !== newStoredMarks;

        // Only recalculate our field values if our node content has changed.
        const newFields = fieldValuesChanged
          ? updateFieldsFromNode({
              node: newNode,
              fields: currentFields,
              innerDecos,
              view,
              getPos,
              serializer,
              getElementDataFromNode,
              transformElementOut,
            })
          : currentFields;

        // Only update our FieldViews if their content or decorations have changed, or the selection or storedMarks have changed.
        if (
          fieldValuesChanged ||
          innerDecosChanged ||
          selectionChangeAffectsNode ||
          storedMarksHaveChanged
        ) {
          updateFieldViewsFromNode(
            newFields,
            newNode,
            innerDecos,
            0,
            newSelection,
            newStoredMarks
          );
        }

        // Only update our consumer if anything internal to the field has changed.
        if (fieldValuesChanged || commandsChanged || isSelectedChanged) {
          update(newFields, newCommands, newIsSelected);
        }

        currentNode = newNode;
        currentIsSelected = newIsSelected;
        currentDecos = innerDecos;
        currentFields = newFields;
        currentCommandValues = newCommandValues;
        currentSelection = newSelection;
        currentStoredMarks = newStoredMarks;

        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(fields as Array<Field<FieldView<unknown>>>).map((field) =>
        field.view.destroy()
      );
      element.destroy(dom);
    },
    ignoreMutation: () => true,
  };
};

const getCommandValues = (
  pos: number,
  range: { from: number; to: number } | undefined
) => ({
  moveUp: range && pos > range.from,
  moveDown: range && pos < range.to,
  moveTop: range && pos > range.from,
  moveBottom: range && pos < range.to,
});

const commandsHaveChanged = (
  oldCommandValues: ReturnType<typeof getCommandValues>,
  newCommandValues: ReturnType<typeof getCommandValues>
) =>
  oldCommandValues.moveBottom !== newCommandValues.moveBottom ||
  oldCommandValues.moveTop !== newCommandValues.moveTop ||
  oldCommandValues.moveUp !== newCommandValues.moveUp ||
  oldCommandValues.moveDown !== newCommandValues.moveDown;

/**
 * Only compares the parts of the node from which we derive field values.
 */
const fieldValuesHaveChanged = (oldNode: Node, newNode: Node) =>
  oldNode.content !== newNode.content ||
  newNode.attrs.fields !== oldNode.attrs.fields;
