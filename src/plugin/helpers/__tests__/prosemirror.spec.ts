import { AllSelection } from "prosemirror-state";
import { defaultPredicate, getValidElementInsertionRange } from "../prosemirror";
import { doc, example, example__caption } from "./fixtures";
import { Node } from "prosemirror-model";

export const logNode = (doc: Node) => {
  console.log(`Log node ${doc.type.name}:`);

  doc.nodesBetween(0, doc.content.size, (node, pos) => {
    const indent = doc.resolve(pos).depth * 4;
    const content =
      node.type.name === "text" ? `'${node.textContent}'` : undefined;
    console.log(
      `${" ".repeat(indent)} ${node.type.name} ${pos}-${pos + node.nodeSize} ${
        content ? content : ""
      }`
    );
  });
};

type TaggedNode = Node & { tag: Record<string, number> };

describe("prosemirror utilities", () => {
  const a = example("<a>", example__caption("a"));
  const b = example("<b>", example__caption("b"));
  const c = example("<c>", example__caption("c"));
  const d = example("<d>", example__caption("d"));
  const document = doc(a, b, c, d);
  const allSelection = new AllSelection(document);

  const getTagNameFromNode = (node: TaggedNode) =>
    Object.keys(node.tag).pop() as string;

  describe("getValidInsertionRange", () => {
    it("gets a valid insertion range", () => {
      const range = getValidElementInsertionRange(document, defaultPredicate);
      logNode(document);
      expect(range).toEqual({
        from: document.tag.a - 1,
        to: document.tag.d + d.nodeSize,
      });
    });
  });
});
