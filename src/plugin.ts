import type { Node } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { Plugin } from "prosemirror-state";
import type { EditorProps } from "prosemirror-view";
import type { GenericEmbedsSpec } from "./embed";
import type { TPredicate } from "./helpers";
import { buildCommands, createDecorations } from "./helpers";
import { RTENodeView } from "./nodeViews/RTENode";
import type { NestedEditorMap, TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";

const decorations = createDecorations("embed");

export type PluginState = { hasErrors: boolean };

export const createPlugin = <
  FieldAttrs extends TFields,
  LocalSchema extends Schema = Schema
>(
  embedsSpec: GenericEmbedsSpec<FieldAttrs>,
  predicate: TPredicate
): Plugin<PluginState, LocalSchema> => {
  type EmbedNode = Node<LocalSchema>;

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

  return new Plugin<PluginState, LocalSchema>({
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
      nodeViews: createNodeViews(embedsSpec, predicate),
    },
  });
};

type NodeViewSpec = NonNullable<EditorProps["nodeViews"]>;

const createNodeViews = <FieldAttrs extends TFields>(
  embedsSpec: GenericEmbedsSpec<FieldAttrs>,
  predicate: TPredicate
): NodeViewSpec => {
  const nodeViews = {} as NodeViewSpec;
  for (const embedName in embedsSpec) {
    nodeViews[embedName] = createNodeView(
      embedName,
      embedsSpec[embedName],
      predicate
    );
  }

  return nodeViews;
};

type NodeViewCreator = NodeViewSpec[keyof NodeViewSpec];

const createNodeView = <FieldAttrs extends TFields>(
  embedName: string,
  createEmbed: TEmbed<FieldAttrs>,
  predicate: TPredicate
): NodeViewCreator => (initNode, view, getPos, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const pos = typeof getPos === "boolean" ? 0 : getPos();

  const nestedEditors = {} as NestedEditorMap;
  const temporaryHardcodedSchema = new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks,
  });

  initNode.forEach((node, offset) => {
    const typeName = node.type.name;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unsure why this triggers
    if (nestedEditors[typeName]) {
      console.error(
        `[prosemirror-embeds]: Attempted to instantiate a nested editor with type ${typeName}, but another instance with that name has already been created.`
      );
    }
    nestedEditors[typeName] = new RTENodeView(
      node,
      view,
      getPos,
      offset,
      temporaryHardcodedSchema,
      innerDecos
    );
  });

  const update = createEmbed(
    dom,
    nestedEditors,
    (fields, hasErrors) => {
      view.dispatch(
        view.state.tr.setNodeMarkup(pos, undefined, {
          ...initNode.attrs,
          fields,
          hasErrors,
        })
      );
    },
    initNode.attrs.fields,
    buildCommands(predicate, pos, view.state, view.dispatch)
  );

  return {
    dom,
    update: (node: Node) => {
      if (
        node.type.name === embedName &&
        node.attrs.type === initNode.attrs.type
      ) {
        update(
          node.attrs.fields,
          buildCommands(predicate, pos, view.state, view.dispatch)
        );
        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => null,
  };
};
