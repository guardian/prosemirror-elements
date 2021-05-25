import type { Node, Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import type { EditorProps } from "prosemirror-view";
import type { Commands } from "./helpers";
import { createDecorations } from "./helpers";
import { getEmbedNodeViewFromType } from "./pluginHelpers";
import type {
  ElementProps,
  NodeViewProp,
  NodeViewPropMapFromProps,
  TEmbed,
} from "./types/Embed";

const decorations = createDecorations("imageEmbed");

export type PluginState = { hasErrors: boolean };

export const createPlugin = <Name extends string, Props extends ElementProps>(
  embedsSpec: Array<TEmbed<Props, Name>>,
  commands: Commands
): Plugin<PluginState, Schema> => {
  type EmbedNode = Node<Schema>;

  const hasErrors = (doc: Node) => {
    let foundError = false;
    doc.descendants((node: EmbedNode) => {
      if (!foundError) {
        if (node.type.name === "embed") {
          foundError = node.attrs.hasErrors as boolean;
        }
      } else {
        return false;
      }
    });
    return foundError;
  };

  return new Plugin<PluginState, Schema>({
    state: {
      init: (_, state) => ({
        hasErrors: hasErrors(state.doc),
      }),
      apply: (_tr, _value, _oldState, state) => ({
        hasErrors: hasErrors(state.doc),
      }),
    },
    props: {
      decorations,
      nodeViews: createNodeViews(embedsSpec, commands),
    },
  });
};

type NodeViewSpec = NonNullable<EditorProps["nodeViews"]>;

const createNodeViews = <Name extends string, Props extends ElementProps>(
  embedsSpec: Array<TEmbed<Props, Name>>,
  commands: Commands
): NodeViewSpec => {
  const nodeViews = {} as NodeViewSpec;
  for (const embed of embedsSpec) {
    nodeViews[embed.name] = createNodeView(embed.name, embed, commands);
  }

  return nodeViews;
};

type NodeViewCreator = NodeViewSpec[keyof NodeViewSpec];

const createNodeView = <Props extends ElementProps, Name extends string>(
  embedName: Name,
  embed: TEmbed<Props, Name>,
  commands: Commands
): NodeViewCreator => (initNode, view, _getPos, _, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const getPos = typeof _getPos === "boolean" ? () => 0 : _getPos;

  const nodeViewPropMap = {} as NodeViewPropMapFromProps<Props>;

  initNode.forEach((node, offset) => {
    const typeName = node.type.name as keyof NodeViewPropMapFromProps<Props>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unsure why this triggers
    if (nodeViewPropMap[typeName]) {
      throw new Error(
        `[prosemirror-embeds]: Attempted to instantiate a nodeView with type ${typeName}, but another instance with that name has already been created.`
      );
    }
    const prop = embed.props.find((prop) => prop.name === typeName);
    if (!prop) {
      throw new Error(
        `[prosemirror-embeds]: Attempted to instantiate a nodeView with type ${typeName}, but could not find the associate prop`
      );
    }
    nodeViewPropMap[typeName] = {
      prop,
      nodeView: getEmbedNodeViewFromType(prop, {
        node,
        view,
        getPos,
        offset,
        innerDecos,
      }),
    };
  });

  const update = embed.createUpdator(
    dom,
    nodeViewPropMap,
    (fields, hasErrors) => {
      view.dispatch(
        view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...initNode.attrs,
          fields,
          hasErrors,
        })
      );
    },
    initNode.attrs.fields,
    commands(getPos, view)
  );

  return {
    dom,
    update: (node, _, innerDecos) => {
      if (
        node.type.name === embedName &&
        node.attrs.type === initNode.attrs.type
      ) {
        update(node.attrs.fields, commands(getPos, view));
        node.forEach((node, offset) => {
          const typeName = node.type
            .name as keyof NodeViewPropMapFromProps<Props>;
          const nestedEditor = nodeViewPropMap[typeName];
          nestedEditor.nodeView.update(node, offset, innerDecos);
        });
        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(nodeViewPropMap).map((editor) =>
        (editor as NodeViewProp).nodeView.destroy()
      );
    },
    ignoreMutation: () => true,
  };
};
