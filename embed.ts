
import { Plugin, EditorState, Transaction } from 'prosemirror-state';
import { Schema, Node, SchemaSpec, NodeSpec } from 'prosemirror-model';
import { canJoin } from 'prosemirror-transform';
import { buildCommands, defaultPredicate, stateToNodeView } from './helpers';
import OrderedMap = require('orderedmap'); 

import buildPlugin from './plugin';

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

<<<<<<< HEAD:embed.ts
const { packDecos, unpackDeco } = stateToNodeView('embed');

const build = (types: {[pluginKey: string]: IEmbedPlugin}, predicate = defaultPredicate) => {
=======
const build = (types, predicate = defaultPredicate) => {
>>>>>>> dcdd4daf46b5d6dc6f68c4fc86dd77edd9c6a16b:embed.js
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
<<<<<<< HEAD:embed.ts
    removeEmbed: (state: EditorState, dispatch: (tr: Transaction) => void) => {
      const pos = getPos();

      const tr = state.tr.delete(pos, pos + 1);

      // merge the surrounding blocks if poss
      if (canJoin(tr.doc, pos)) {
          tr.join(pos);
      }

      dispatch(tr);
    },
    plugin: new Plugin({
      state: {
        init: () => ({
          errors: []
        }),
        apply: (tr: Transaction, value, oldState: EditorState, newState: EditorState) => {
          const errors: string[] = [];
          newState.doc.descendants((node, pos, parent) => {
            if (node.type.name === 'embed') {
              errors.push(...node.attrs.errors);
            }
          });
          return {
            errors
          };
        }
      },
      props: {
        decorations: packDecos,
        nodeViews: {
          embed: (initNode, view, getPos) => {
            const dom = document.createElement('div');
            const mount = types[initNode.attrs.type];

            const update = mount(
              dom,
              (fields: string[], errors = []) => {
                view.dispatch(
                  view.state.tr.setNodeMarkup(getPos(), undefined, {
                    ...initNode.attrs,
                    fields,
                    errors
                  })
                );
              },
              initNode.attrs.fields,
              commands(getPos(), view.state, view.dispatch)
            );

            return {
              dom,
              update: (node, decorations) => {
                if (
                  node.type.name === 'embed' &&
                  node.attrs.type === initNode.attrs.type
                ) {
                  update(
                    node.attrs.fields,
                    commands(getPos(), unpackDeco(decorations), view.dispatch)
                  );
                  return true;
                }
                return false;
              },
              stopEvent: () => true,
              destroy: () => null
            };
          }
        }
      }
    })
=======
    hasErrors: state => plugin.getState(state).hasErrors,
    plugin
>>>>>>> dcdd4daf46b5d6dc6f68c4fc86dd77edd9c6a16b:embed.js
  };
};

export { build, addEmbedNode };
