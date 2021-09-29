import type { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const placeholderAttribute = "data-cy-is-placeholder";

const getPlaceholder = (text: string) => {
  const span = document.createElement("span");
  span.style.display = "inline-block";
  span.style.height = "0px";
  span.style.width = "0px";
  span.style.whiteSpace = "nowrap";
  span.style.fontStyle = "italic";
  span.style.color = "#777";
  span.style.pointerEvents = "none";
  span.style.cursor = "text";
  span.draggable = false;
  span.innerHTML = text;
  span.setAttribute(placeholderAttribute, "true");
  return span;
};

export const containsPlaceholder = (element: HTMLElement): boolean =>
  !!element.querySelector(`span[${placeholderAttribute}]`);

/**
 * Get the first placeholder position in the document – assumed
 * to be the starting position of the deepest first child.
 */
const getFirstPlaceholderPosition = (node: Node, currentPos = 0): number =>
  node.firstChild
    ? getFirstPlaceholderPosition(
        node.firstChild,
        currentPos + node.content.size
      )
    : currentPos + node.content.size;

export const createPlaceholderDecos = (text: string) => ({
  doc,
}: {
  doc: Node;
}) => {
  if (doc.textContent) {
    return DecorationSet.empty;
  }

  // If the document contains inline content only, just place the widget at its start.
  const pos = doc.inlineContent ? 0 : getFirstPlaceholderPosition(doc);
  return DecorationSet.create(doc, [
    Decoration.widget(pos, getPlaceholder(text)),
  ]);
};

export const createPlaceholderPlugin = (text: string) =>
  new Plugin({
    props: {
      decorations: createPlaceholderDecos(text),
    },
  });
