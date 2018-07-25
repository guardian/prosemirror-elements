import { Plugin } from 'prosemirror-state';
import { Schema, Node } from 'prosemirror-model';
import { canJoin } from 'prosemirror-transform';

const addEmbedNode = (schema: Schema) =>
  schema.append({
    embed: {
      group: 'block',
      attrs: {
        type: {},
        fields: {
          default: {}
        },
        errors: {
          default: []
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

const build = types => {
  const typeNames = Object.keys(types);

  return {
    insertEmbed: (type, fields = {}) => (state, dispatch) => {
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
    removeEmbed: (state, dispatch) => {
      const pos = getPos();

      const tr = view.state.tr.delete(pos, pos + 1);

      // merge the surrounding blocks if poss
      if (canJoin(tr.doc, pos)) {
          tr.join(pos);
      }

      view.dispatch(tr);
    },
    plugin: new Plugin({
      state: {
        init: () => ({
          errors: []
        }),
        apply: (tr, value, oldState, newState) => {
          const errors = [];
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
        nodeViews: {
          embed: (initNode, view, getPos) => {
            const dom = document.createElement('div');
            const mount = types[initNode.attrs.type];

            const update = mount(
              dom,
              (fields, errors = []) => {
                view.dispatch(
                  view.state.tr.setNodeMarkup(getPos(), null, {
                    ...initNode.attrs,
                    fields,
                    errors
                  })
                );
              },
              initNode.attrs.fields
            );
            return {
              dom,
              update: node => {
                update(node.attrs.fields);
                return (
                  node.type.name === 'embed' &&
                  node.attrs.type === initNode.attrs.type
                );
              },
              stopEvent: () => true
            };
          }
        }
      }
    })
  };
};

export { build, addEmbedNode };
