import type OrderedMap from "orderedmap";
import type { NodeSpec, Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { baseEmbedSchema } from "./baseSchema";
import { buildCommands, defaultPredicate } from "./helpers";
import { createPlugin } from "./plugin";
import type { TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";

const addEmbedNode = (schemaSpec: OrderedMap<NodeSpec>): OrderedMap<NodeSpec> =>
  schemaSpec.append(baseEmbedSchema);

export type EmbedsSpec<EmbedTypes extends string> = {
  [key in EmbedTypes]: TEmbed;
};

// Sometimes we don't need to keep so much type information about the embed
// spec around when passing it – for example, when consuming it for internal
// purposes. In this case, using GenericEmbedsSpec avoids the type parameters
// in EmbedsSpec, improving ergonomics.
export type GenericEmbedsSpec = Record<string, TEmbed>;

const build = <EmbedKeys extends string>(
  types: EmbedsSpec<EmbedKeys>,
  predicate = defaultPredicate
) => {
  const typeNames = Object.keys(types);

  const insertEmbed = <EmbedKey extends EmbedKeys>(
    type: EmbedKey,
    fields: TFields
  ) => (
    state: EditorState,
    dispatch: (tr: Transaction<Schema>) => void
  ): void => {
    if (!typeNames.includes(type)) {
      throw new Error(
        `[prosemirror-embeds]: ${type} is not recognised. Only ${typeNames.join(
          ", "
        )} can be added`
      );
    }
    const newNode = (state.schema as Schema).nodes[type].createAndFill({
      type,
      fields,
    });
    if (newNode) {
      dispatch(state.tr.replaceSelectionWith(newNode));
    } else {
      // This shouldn't happen, as the schema should always be able to fill
      // the node with correct children if we're not supplying content –
      // see https://prosemirror.net/docs/ref/#model.NodeType.createAndFill
      console.warn(`[prosemirror-embeds]: could not create node for ${type}`);
    }
  };

  const plugin = createPlugin(types, buildCommands(predicate));

  return {
    insertEmbed,
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
  };
};

export { build, addEmbedNode };
