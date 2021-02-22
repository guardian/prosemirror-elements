import { NodeSpec } from "prosemirror-model";

export const addImageNode = (schema: OrderedMap<NodeSpec>) => schema.append({
  caption: {
    group: "block",
    content: "paragraph",
    toDOM() {
      return ["div", { class: "imageNative-caption" }, 0];
    },
    parseDOM: [{ tag: "div" }],
  },
  altText: {
    group: "block",
    content: "paragraph",
    toDOM() {
      return ["div", { class: "imageNative-altText" }, 0];
    },
    parseDOM: [{ tag: "div" }],
  },
  imageNative: {
    content: "caption altText",
    group: "block",
    toDOM() {
      return ["imageNative", 0];
    },
    parseDOM: [{ tag: "imageNative" }],
  },
  text: {
    group: "inline"
  },
})

export class ImageNodeView {
  public dom = document.createElement('image')
  public contentDOM = document.createElement('div')

  constructor() {
    this.contentDOM.classList.add("imageNative-content");
    this.dom.appendChild(this.contentDOM);
  }
}
