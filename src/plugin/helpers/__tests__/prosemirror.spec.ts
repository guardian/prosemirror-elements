import { defaultPredicate, getValidElementInsertionRange } from "../prosemirror";
import { doc, example, example__caption } from "./fixtures";
import { Node } from "prosemirror-model";

describe("prosemirror utilities", () => {
  const a = example("<a>", example__caption("a"));
  const b = example("<b>", example__caption("b"));
  const c = example("<c>", example__caption("c"));
  const d = example("<d>", example__caption("d"));
  const document = doc(a, b, c, d);

  describe("getValidInsertionRange", () => {
    it("gets a valid insertion range", () => {
      const range = getValidElementInsertionRange(document, defaultPredicate);
      expect(range).toEqual({
        from: document.tag.a - 1,
        to: document.tag.d + d.nodeSize,
      });
    });

    it("returns undefined if no range is possible", () => {
      const range = getValidElementInsertionRange(doc(), defaultPredicate);
      expect(range).toEqual(undefined);
    });
  });
});
