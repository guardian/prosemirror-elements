import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const testDecorationPlugin = new Plugin({
  props: {
    decorations: (state) => {
      const decorateThisPhrase = "deco";
      const ranges = [] as Array<[number, number]>;
      state.doc.descendants((node, offset) => {
        if (node.isLeaf && node.textContent) {
          const indexOfDeco = node.textContent.indexOf(decorateThisPhrase);
          if (indexOfDeco !== -1) {
            ranges.push([
              indexOfDeco + offset,
              indexOfDeco + offset + decorateThisPhrase.length,
            ]);
          }
        }
      });

      return DecorationSet.create(
        state.doc,
        ranges.map(([from, to]) =>
          Decoration.inline(from, to, { class: "TestDecoration" })
        )
      );
    },
  },
});

export const trimHtml = (html: string) => html.replace(/>\s+</g, "><").trim();
