import type { Node, Schema } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import type { Decoration, DecorationSet, EditorProps } from "prosemirror-view";
import type {
  ElementSpec,
  ElementSpecMap,
  FieldDescriptions,
  FieldNameToField,
} from "../plugin/types/Element";
import type { FieldNameToValueMap } from "./fieldViews/helpers";
import { getElementFieldViewFromType } from "./helpers/plugin";
import type { Commands } from "./helpers/prosemirror";
import { createUpdateDecorations } from "./helpers/prosemirror";
import { getFieldNameFromNode } from "./nodeSpec";

const decorations = createUpdateDecorations();
const pluginKey = new PluginKey("prosemirror_elements");

export type PluginState = unknown;

export const createPlugin = <
  ElementNames extends string,
  ExternalData,
  FDesc extends FieldDescriptions<string>
>(
  elementsSpec: {
    [elementName in ElementNames]: ElementSpec<FDesc, ExternalData>;
  },
  commands: Commands
): Plugin<PluginState, Schema> => {
  return new Plugin<PluginState, Schema>({
    key: pluginKey,
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
    nodeViews[elementName] = createNodeView(
      elementName,
      elementsSpec[elementName],
      commands
    );
  }

  return nodeViews;
};

type NodeViewCreator = NodeViewSpec[keyof NodeViewSpec];

const createNodeView = <
  FDesc extends FieldDescriptions<string>,
  ElementName extends string
>(
  elementName: ElementName,
  element: ElementSpec<FDesc>,
  commands: Commands
): NodeViewCreator => (initNode, view, _getPos, _, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const getPos = typeof _getPos === "boolean" ? () => 0 : _getPos;

  const fields = {} as FieldNameToField<FDesc>;

  initNode.forEach((node, offset) => {
    const name = getFieldNameFromNode(node) as keyof FieldNameToField<FDesc>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unsure why this triggers
    if (fields[name]) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${name}, but another instance with that name has already been created.`
      );
    }
    const fieldDescriptions = element.fieldDescriptions[name];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- strictly, we should check.
    if (!fieldDescriptions) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${name}, but could not find the associate field`
      );
    }

    const fieldView = getElementFieldViewFromType(fieldDescriptions, {
      node,
      view,
      getPos,
      offset,
      innerDecos,
    });

    fields[name] = ({
      description: fieldDescriptions,
      name,
      view: fieldView,
      // We coerce types here: it's difficult to prove we've the right shape here
      // to the compiler, and we're already beholden to runtime behaviour as there's
      // no guarantee that the node's `name` matches our spec. The errors above should
      // help to defend when something's wrong.
      update: (value: unknown) =>
        (fieldView.update as (value: unknown) => void)(value),
    } as unknown) as FieldNameToField<FDesc>[typeof name];
  });

  const getValuesFromNode = (
    node: Node,
    decos: Decoration[] | DecorationSet
  ) => {
    // We gather the values from each child as we iterate over the
    // node, to update the renderer. It's difficult to be typesafe here,
    // as the Node's name value is loosely typed as `string`, and so we
    // cannot index into the element `fieldDescription` to discover the appropriate type.
    const fieldValues: Record<string, unknown> = {};
    node.forEach((node, offset) => {
      const fieldName = getFieldNameFromNode(
        node
      ) as keyof FieldNameToField<FDesc>;
      const field = fields[fieldName];
      field.view.onUpdate(node, offset, decos);
      fieldValues[fieldName] = field.view.getNodeValue(node);
    });

    return fieldValues as FieldNameToValueMap<FDesc>;
  };

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
    getValuesFromNode(initNode, innerDecos),
    commands(getPos, view)
  );

  return {
    dom,
    update: (node, _, innerDecos) => {
      if (
        node.type.name === elementName &&
        node.attrs.type === initNode.attrs.type
      ) {
        const fieldValues = getValuesFromNode(node, innerDecos);
        update(fieldValues, commands(getPos, view));

        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(fields).map((field) => field.view.destroy());
    },
    ignoreMutation: () => true,
  };
};
