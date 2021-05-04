import { EditorState, Transaction } from "prosemirror-state";
import { Schema, Node, NodeSpec } from "prosemirror-model";
import OrderedMap from "orderedmap";
import { buildCommands, defaultPredicate } from "./helpers";
import Embed from "./types/Embed";

import buildPlugin from "./plugin";
import TFields from "./types/Fields";
import baseEmbedSchema from "./embedSchema";

const appendEmbedSchema = (
  currentSchema: OrderedMap<NodeSpec>,
  incomingSchema: OrderedMap<NodeSpec>
) => currentSchema.append(incomingSchema);

const build = (
  types: { [embedName: string]: Embed<TFields> },
  predicate = defaultPredicate
) => {
  const typeNames = Object.keys(types);
  const plugin = buildPlugin(types, buildCommands(predicate));
  const schema = Object.values(types)
    .map(embed => embed.schema)
    .reduce(appendEmbedSchema, baseEmbedSchema);

  return {
    schema,
    insertEmbed: (type: string, fields = {}) => (
      state: EditorState,
      dispatch: (tr: Transaction<Schema>) => void
    ) => {
      if (typeNames.indexOf(type) === -1) {
        throw new Error(
          `[prosemirror-embeds]: ${type} is not recognised – only elements of type ${typeNames.join(
            ", "
          )} have been registered`
        );
      }
      // check whether we can
      dispatch(
        state.tr.replaceSelectionWith(
          state.schema.nodes.embed.create({ type, fields })
        )
      );
    },
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
  };
};

export { build, appendEmbedSchema as addEmbedNode };
