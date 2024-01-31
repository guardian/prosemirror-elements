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
import { pluginKey } from "./helpers/constants";
import { GetElementDataFromNode, TransformElementOut, createGetElementDataFromNode, getFieldValuesFromNode } from "./helpers/element";
import type { Commands } from "./helpers/prosemirror";
import { createUpdateDecorations } from "./helpers/prosemirror";
import {
  elementSelectedNodeAttr,
  getNodeNameFromElementName,
  isProseMirrorElement,
  isProseMirrorElementSelected,
} from "./nodeSpec";
import { FieldView } from "./fieldViews/FieldView";

const decorations = createUpdateDecorations();

export type PluginState = unknown;

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
  commands: Commands,
  sendTelemetryEvent: SendTelemetryEvent,
  getElementDataFromNode: GetElementDataFromNode<ElementNames, ESpecMap>,
  transformElementOut?: TransformElementOut
): Plugin<PluginState> => {
  return new Plugin<PluginState>({
    key: pluginKey,
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
  const getPos = typeof _getPos === "boolean" ? () => 0 : _getPos;

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
    transformElementOut
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
  let currentCommandValues = getCommandValues(initCommands);

  const getElementDataForUpdator = () =>
    getFieldValuesFromNode(currentNode, element.fieldDescriptions, serializer, getElementDataFromNode, transformElementOut);

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
        const newIsSelected = isProseMirrorElementSelected(newNode);
        const newCommands = commands(getPos, view);
        const newCommandValues = getCommandValues(newCommands);

        const isSelectedChanged = currentIsSelected !== newIsSelected;
        const innerDecosChanged = currentDecos !== innerDecos;
        const fieldValuesChanged = fieldValuesHaveChanged(currentNode, newNode);
        const commandsChanged = commandsHaveChanged(
          currentCommandValues,
          newCommandValues
        );

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
              transformElementOut
            })
          : currentFields;

        // Only update our FieldViews if their content or decorations have changed.
        if (fieldValuesChanged || innerDecosChanged) {
          updateFieldViewsFromNode(newFields, newNode, innerDecos);
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

        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(fields as Field<FieldView<unknown>>).map((field) => field.view.destroy());
      element.destroy(dom);
    },
    ignoreMutation: () => true,
  };
};

const getCommandValues = (commands: ReturnType<Commands>) => ({
  moveUp: commands.moveUp(false),
  moveDown: commands.moveDown(false),
  moveTop: commands.moveTop(false),
  moveBottom: commands.moveBottom(false),
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
