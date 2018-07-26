
import { Plugin, EditorState, Transaction } from 'prosemirror-state';
import { Schema, Node, SchemaSpec, NodeSpec } from 'prosemirror-model';
import { canJoin } from 'prosemirror-transform';
import { buildCommands, defaultPredicate, createDecorations } from './helpers';
import Embed from './types/Embed';

import buildPlugin from './plugin';
import TFields from './types/Fields';

const addEmbedNode = (schema: OrderedMap<NodeSpec>) =>
  schema.append({
    embed: {
      group: 'block',
      attrs: {
        type: {},
        fields: {
          default: {}
        },
        hasErrors: {
          default: false
        }
      },
      draggable: false,
      toDOM: (node: Node) => [
        'embed-attrs',
        {
          type: node.attrs.type,
          fields: JSON.stringify(node.attrs.fields),
          errors: JSON.stringify(node.attrs.errors)
        }
      ],
      parseDOM: [
        {
          tag: 'embed-attrs',
          getAttrs: (dom: HTMLElement) => ({
            type: dom.getAttribute('type'),
            fields: JSON.parse(dom.getAttribute('fields') || ''),
            errors: JSON.parse(dom.getAttribute('errors') || '')
          })
        }
      ]
    }
  });

const build = (types: {[pluginKey: string]: Embed<TFields>}, predicate = defaultPredicate) => {
  const typeNames = Object.keys(types);
  const plugin = buildPlugin(types, buildCommands(predicate));
  return {
    insertEmbed: (type: string, fields = {}) => (state: EditorState, dispatch: (tr: Transaction<Schema>) => void) => {
      if (typeNames.indexOf(type) === -1) {
        throw new Error(
          `[prosemirror-embeds]: ${type} is not recognised. Only ${typeNames.join(
            ', '
          )} have can be added`
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
    plugin
  };
};

export { build, addEmbedNode };
