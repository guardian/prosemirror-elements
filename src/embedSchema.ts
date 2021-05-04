import OrderedMap from "orderedmap";
import { Node, NodeSpec } from "prosemirror-model";

const baseEmbedSchema: OrderedMap<NodeSpec> = OrderedMap.from({
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
        'has-errors': JSON.stringify(node.attrs.hasErrors)
      }
    ],
    parseDOM: [
      {
        tag: 'embed-attrs',
        getAttrs: (dom: Element) => {
          if (typeof dom === 'string') { return }
          const hasErrorAttr = dom.getAttribute('has-errors');
          console.log(dom.getAttribute('fields'));
          return {
            type: dom.getAttribute('type'),
            fields: JSON.parse(dom.getAttribute('fields') || '{}'),
            hasErrors: hasErrorAttr && hasErrorAttr !== 'false'
          };
        }
      }
    ]
  }
})

export default baseEmbedSchema;
