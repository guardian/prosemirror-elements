import type { Node, Schema } from "prosemirror-model";
import { DOMParser, DOMSerializer } from "prosemirror-model";

export const createParsers = <S extends Schema>(schema: S) => {
  const parser = DOMParser.fromSchema(schema);
  const serializer = DOMSerializer.fromSchema(schema);
  return { parser, serializer };
};

export const docToHtml = (serializer: DOMSerializer, doc: Node) => {
  const dom = serializer.serializeFragment(doc.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};

export const htmlToDoc = (parser: DOMParser, html: string) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return parser.parse(dom);
};
