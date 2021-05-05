import type OrderedMap from "orderedmap";
import type { NodeSpec, Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { baseEmbedSchema } from "./baseSchema";
import { defaultPredicate } from "./helpers";
import { createPlugin } from "./plugin";
import type { TEmbed } from "./types/Embed";
import type { TFields } from "./types/Fields";

const addEmbedNode = (schemaSpec: OrderedMap<NodeSpec>): OrderedMap<NodeSpec> =>
  schemaSpec.append(baseEmbedSchema);

export type EmbedsSpec<
  EmbedTypes extends string,
  EmbedFields extends TFields
> = { [key in EmbedTypes]: TEmbed<EmbedFields> };

// Sometimes we don't need to keep so much type information about the embed
// spec around when passing it – for example, when consuming it for internal
// purposes. In this case, using GenericEmbedsSpec avoids the type parameters
// in EmbedsSpec, improving ergonomics.
export type GenericEmbedsSpec<FieldAttrs extends TFields> = Record<
  string,
  TEmbed<FieldAttrs>
>;

type GetFieldsFromTEmbed<PEmbed> = PEmbed extends TEmbed<infer Fields>
  ? Fields
  : never;

const build = <EmbedKeys extends string, EmbedFields extends TFields>(
  types: EmbedsSpec<EmbedKeys, EmbedFields>,
  predicate = defaultPredicate
) => {
  const typeNames = Object.keys(types);

  const insertEmbed = <EmbedKey extends EmbedKeys>(
    type: EmbedKey,
    fields: GetFieldsFromTEmbed<EmbedsSpec<EmbedKey, EmbedFields>[EmbedKey]>
  ) => (
    state: EditorState,
    dispatch: (tr: Transaction<Schema>) => void
  ): void => {
    if (!typeNames.includes(type)) {
      throw new Error(
        `[prosemirror-embeds]: ${type} is not recognised. Only ${typeNames.join(
          ", "
        )} have can be added`
      );
    }
    dispatch(
      state.tr.replaceSelectionWith(
        (state.schema as Schema).nodes[type].create({ type, fields })
      )
    );
  };

  const plugin = createPlugin<EmbedFields>(types, predicate);

  return {
    insertEmbed,
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
  };
};

export { build, addEmbedNode };
