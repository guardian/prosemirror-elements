import { Plugin } from 'prosemirror-state';

const addEmbedNode = schema =>
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
      toDOM: node => [
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
          getAttrs: dom => ({
            type: dom.getAttribute('type'),
            fields: JSON.parse(dom.getAttribute('fields')),
            errors: JSON.parse(dom.getAttribute('errors'))
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
