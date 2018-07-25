import { buildCommands, defaultPredicate } from './helpers';
import buildPlugin from './plugin';

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

const build = (types, predicate = defaultPredicate) => {
  const typeNames = Object.keys(types);
  const plugin = buildPlugin(types, buildCommands(predicate));
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
    getErrors: state => plugin.getState(state).errors,
    plugin
  };
};

export { build, addEmbedNode };
