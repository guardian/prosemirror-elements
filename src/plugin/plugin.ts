import type { Node, Schema } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import type { EditorProps } from "prosemirror-view";
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

export const createPlugin = <
  ElementNames extends string,
  FDesc extends FieldDescriptions<string>
>(
  elementsSpec: {
    [elementName in ElementNames]: ElementSpec<FDesc>;
  },
  commands: Commands
): Plugin<PluginState, Schema> => {
  return new Plugin<PluginState, Schema>({
    key: pluginKey,
    appendTransaction: (trs, oldState, newState) => {
      if (newState.selection.from === newState.selection.to) {
        return;
      }

      const tr = newState.tr;
      const selectedElements = new Map<
        Node,
        {
          from: number;
          to: number;
        }
      >();

      newState.doc.nodesBetween(
        newState.selection.from,
        newState.selection.to,
        (node, pos) => {
          if (!isProseMirrorElement(node)) {
            return false;
          }
          if (
            newState.selection.from <= pos &&
            newState.selection.to > pos + node.nodeSize
          ) {
            selectedElements.set(node, {
              from: pos,
              to: pos + node.nodeSize,
            });
          }
        }
      );

      newState.doc.descendants((node, pos) => {
        if (!isProseMirrorElement(node)) {
          return false;
        }
        if (isProseMirrorElementSelected(node) && !selectedElements.get(node)) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            [elementSelectedNodeAttr]: false,
          });
        }
      });

      selectedElements.forEach(({ from }, node) => {
        const newAttrs = {
          ...node.attrs,
          [elementSelectedNodeAttr]: true,
        };
        tr.setNodeMarkup(from, undefined, newAttrs);
      });

      return tr;
    },
    props: {
      decorations,
      nodeViews: createNodeViews(
        elementsSpec as ElementSpecMap<FDesc, ElementNames>,
        commands
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
  commands: Commands
): NodeViewSpec => {
  const nodeViews = {} as NodeViewSpec;
  for (const elementName in elementsSpec) {
    const nodeName = getNodeNameFromElementName(elementName);
    nodeViews[nodeName] = createNodeView(
      nodeName,
      elementsSpec[elementName],
      commands
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
  commands: Commands
): NodeViewCreator => (initNode, view, _getPos, _, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const getPos = typeof _getPos === "boolean" ? () => 0 : _getPos;

  const fields = {} as FieldNameToField<FDesc>;

  initNode.forEach((node, offset) => {
    const fieldName = getFieldNameFromNode(
      node
    ) as keyof FieldNameToField<FDesc>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unsure why this triggers
    if (fields[fieldName]) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${fieldName}, but another instance with that name has already been created.`
      );
    }
    const fieldDescriptions = element.fieldDescriptions[fieldName];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- strictly, we should check.
    if (!fieldDescriptions) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${fieldName}, but could not find the associate field`
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
        (fieldView.update as (value: unknown) => void)(value),
    } as unknown) as FieldNameToField<FDesc>[typeof fieldName];
  });

  const initValues = getFieldValuesFromNode(fields, initNode);
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
  let currentCommandValues = getCommandValues(initCommands);

  const update = element.createUpdator(
    dom,
    fields,
    (fields) => {
      console.log("update", fields);
      view.dispatch(
        view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...initNode.attrs,
          fields,
        })
      );
    },
    initValues,
    initCommands
  );

  return {
    dom,
    update: (node, _, innerDecos) => {
      if (
        node.type.name === nodeName &&
        node.attrs.type === initNode.attrs.type
      ) {
        console.log(node.attrs);
        const newCommands = commands(getPos, view);
        const newCommandValues = getCommandValues(newCommands);
        const fieldValuesChanged = node !== currentNode;
        const innerDecosChanged = currentDecos !== innerDecos;
        const commandsChanged = commandsHaveChanged(
          currentCommandValues,
          newCommandValues
        );

        // Only recalculate our field values if our node content has changed.
        const newFieldValues = fieldValuesChanged
          ? getFieldValuesFromNode(fields, node)
          : currentValues;

        // Only update our FieldViews if their content or decorations have changed.
        if (fieldValuesChanged || innerDecosChanged) {
          updateFieldViewsFromNode(fields, node, innerDecos);
        }

        // Only update our consumer if anything internal to the field has changed.
        if (fieldValuesChanged || commandsChanged) {
          update(newFieldValues, newCommands);
        }

        currentNode = node;
        currentValues = newFieldValues;
        currentDecos = innerDecos;
        currentCommandValues = newCommandValues;

        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(fields).map((field) => field.view.destroy());
    },
    ignoreMutation: () => true,
    setSelection: (...args) => console.log(args),
    selectNode: () => {
      console.log("hai");
    },
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
