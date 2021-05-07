// Mix the nodes from prosemirror-schema-list into the basic schema to

import type OrderedMap from "orderedmap";
import type { Node, NodeSpec } from "prosemirror-model";
import { DOMParser, DOMSerializer, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addEmbedNode } from "./embed";

// create a schema with list support.
export const mySchema = new Schema({
  nodes: addEmbedNode(schema.spec.nodes as OrderedMap<NodeSpec>),
  marks: schema.spec.marks,
});

const parser = DOMParser.fromSchema(mySchema);
const serializer = DOMSerializer.fromSchema(mySchema);

export const docToHtml = (doc: Node) => {
  const dom = serializer.serializeFragment(doc.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};

export const htmlToDoc = (html: string) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return parser.parse(dom);
};
