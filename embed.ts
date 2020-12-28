import { EditorState, Transaction } from 'prosemirror-state';
import { Schema, Node, NodeSpec } from 'prosemirror-model';

import { buildCommands, defaultIsValidMoveNode, getEmbedAttrsFromNode } from './helpers';
import Embed from './types/Embed';
import buildPlugin from './plugin';
import TFields from './types/Fields';

const addEmbedNode = (schema: OrderedMap<NodeSpec>): OrderedMap<NodeSpec> =>
  schema.append({
    embed: {
      group: 'element',
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
          'has-errors': JSON.stringify(node.attrs.hasErrors)
        }
      ],
      parseDOM: [
        {
          tag: 'embed-attrs',
          getAttrs: (dom: HTMLElement) => {
            const hasErrorAttr = dom.getAttribute('has-errors');
            return {
              type: dom.getAttribute('type'),
              fields: JSON.parse(dom.getAttribute('fields') || '{}'),
              hasErrors: hasErrorAttr && hasErrorAttr !== 'false'
            };
          }
        }
      ]
    }
  });

/**
 * Creates an plugin responsible for the display and management of Embeds.
 *
 * Embeds are atomic entities that represent novel content in the document – for
 * example, images, videos, or iFramed content. See `/embeds` for functions to
 * construct them.
 *
 * @param types A map from an embed name to an Embed.
 * @param isValidMoveNode A predicate used to determine which nodes should be
 *  considered when move commands are issued.
 */
const createPlugin = <TEmbedMap extends Record<string, Embed<TFields>>>(
  types: TEmbedMap,
  isValidMoveNode = defaultIsValidMoveNode
) => {
  type EmbedKeys = keyof TEmbedMap;
  const typeNames = Object.keys(types);
  const plugin = buildPlugin(types, buildCommands(isValidMoveNode));
  return {
    insertEmbed: (type: EmbedKeys, fields = {}) => (
      state: EditorState,
      dispatch: (tr: Transaction<Schema>) => void
    ) => {
      if (typeNames.indexOf(type.toString()) === -1) {
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

export { createPlugin, addEmbedNode, getEmbedAttrsFromNode };
