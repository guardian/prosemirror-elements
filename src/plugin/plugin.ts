import { DOMSerializer } from "prosemirror-model";
import type { Node, Schema } from "prosemirror-model";
import type { EditorState } from "prosemirror-state";
import { NodeSelection, Plugin, PluginKey } from "prosemirror-state";
import type { EditorProps } from "prosemirror-view";
import type { SendTelemetryEvent } from "../elements/helpers/types/TelemetryEvents";
import type {
  ElementSpec,
  ElementSpecMap,
  FieldDescriptions,
  FieldNameToField,
} from "../plugin/types/Element";
import {
  getElementFieldViewFromType,
  getFieldValuesFromNode,
  updateFieldViewsFromNode,
} from "./helpers/fieldView";
import type { Commands } from "./helpers/prosemirror";
import { createUpdateDecorations } from "./helpers/prosemirror";
import {
  elementSelectedNodeAttr,
  getFieldNameFromNode,
  getNodeNameFromElementName,
  isProseMirrorElement,
  isProseMirrorElementSelected,
} from "./nodeSpec";

const decorations = createUpdateDecorations();
const pluginKey = new PluginKey("prosemirror_elements");

export type PluginState = unknown;

const selectionIsZeroWidth = (state: EditorState) =>
  state.selection.from === state.selection.to;

export const createPlugin = <
  ElementNames extends string,
  FDesc extends FieldDescriptions<string>
>(
  elementsSpec: {
    [elementName in ElementNames]: ElementSpec<FDesc>;
  },
  commands: Commands,
  sendTelemetryEvent: SendTelemetryEvent
): Plugin<PluginState, Schema> => {
  return new Plugin<PluginState, Schema>({
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
        sendTelemetryEvent
      ),
    },
  });
};

type NodeViewSpec = NonNullable<EditorProps["nodeViews"]>;

const createNodeViews = <
  ElementNames extends string,
  FDesc extends FieldDescriptions<string>
>(
  elementsSpec: ElementSpecMap<FDesc, ElementNames>,
  commands: Commands,
  sendTelemetryEvent: SendTelemetryEvent
): NodeViewSpec => {
  const nodeViews = {} as NodeViewSpec;
  for (const elementName in elementsSpec) {
    const nodeName = getNodeNameFromElementName(elementName);
    nodeViews[nodeName] = createNodeView(
      nodeName,
      elementsSpec[elementName],
      commands,
      sendTelemetryEvent
    );
  }

  return nodeViews;
};

type NodeViewCreator = NodeViewSpec[keyof NodeViewSpec];

const createNodeView = <
  FDesc extends FieldDescriptions<string>,
  NodeName extends string
>(
  nodeName: NodeName,
  element: ElementSpec<FDesc>,
  commands: Commands,
  sendTelemetryEvent: SendTelemetryEvent
): NodeViewCreator => (initNode, view, _getPos, _, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const getPos = typeof _getPos === "boolean" ? () => 0 : _getPos;

  const fields = {} as FieldNameToField<FDesc>;

  initNode.forEach((node, offset) => {
    const fieldName = getFieldNameFromNode(
      node
    ) as keyof FieldNameToField<FDesc>;
    const fieldDescriptions = element.fieldDescriptions[fieldName];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- strictly, we should check.
    if (!fieldDescriptions) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${fieldName}, but could not find the associated field`
      );
    }

    const fieldView = getElementFieldViewFromType(fieldDescriptions, {
      node,
      view,
      getPos,
      offset,
      innerDecos,
    });

    fields[fieldName] = ({
      description: fieldDescriptions,
      name: fieldName,
      view: fieldView,
      // We coerce types here: it's difficult to prove we've the right shape here
      // to the compiler, and we're already beholden to runtime behaviour as there's
      // no guarantee that the node's `name` matches our spec. The errors above should
      // help to defend when something's wrong.
      update: (value: unknown) =>
        fieldView && (fieldView.update as (value: unknown) => void)(value),
    } as unknown) as FieldNameToField<FDesc>[typeof fieldName];
  });

  const serializer = DOMSerializer.fromSchema(initNode.type.schema);
  const initValues = getFieldValuesFromNode(fields, initNode, serializer);
  const initCommands = commands(getPos, view);

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
  let currentNode = initNode;
  let currentValues = initValues;
  let currentDecos = innerDecos;
  let currentIsSelected = false;
  let currentCommandValues = getCommandValues(initCommands);

  const update = element.createUpdator(
    dom,
    fields,
    (fields) => {
      view.dispatch(
        view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...initNode.attrs,
          fields,
        })
      );
    },
    initValues,
    initCommands,
    sendTelemetryEvent
  );

  return {
    dom,
    update: (newNode, _, innerDecos) => {
      if (
        newNode.type.name === nodeName &&
        newNode.attrs.type === initNode.attrs.type
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
        const newFieldValues = fieldValuesChanged
          ? getFieldValuesFromNode(fields, newNode, serializer)
          : currentValues;

        // Only update our FieldViews if their content or decorations have changed.
        if (fieldValuesChanged || innerDecosChanged) {
          updateFieldViewsFromNode(fields, newNode, innerDecos);
        }

        // Only update our consumer if anything internal to the field has changed.
        if (fieldValuesChanged || commandsChanged || isSelectedChanged) {
          update(newFieldValues, newCommands, newIsSelected);
        }

        currentNode = newNode;
        currentIsSelected = newIsSelected;
        currentDecos = innerDecos;
        currentValues = newFieldValues;
        currentCommandValues = newCommandValues;

        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(fields).map((field) => field.view.destroy());
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
