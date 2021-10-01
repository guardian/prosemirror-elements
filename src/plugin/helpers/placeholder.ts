import type { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const placeholderTestAttribute = "placeholder";

const getDefaultPlaceholder = (text: string) => {
  const span = document.createElement("span");
  span.style.display = "inline-block";
  span.style.width = "90%";
  span.style.whiteSpace = "nowrap";
  span.style.overflowX = "hidden";
  span.style.textOverflow = "ellipsis";
  span.style.verticalAlign = "bottom";
  span.style.fontFamily = "Guardian Agate Sans";
  // Passes accessibility contrast on a white background
  span.style.color = "#777575";
  span.style.pointerEvents = "none";
  span.style.cursor = "text";
  span.draggable = false;
  span.innerHTML = text;
  span.setAttribute("data-cy", placeholderTestAttribute);

  return span;
};

export const containsPlaceholder = (element: HTMLElement): boolean =>
  !!element.querySelector(`span[${placeholderTestAttribute}]`);

/**
 * Get the first placeholder position in the document – assumed
 * to be the starting position of the deepest first child.
 */
const getFirstPlaceholderPosition = (node: Node, currentPos = 0): number =>
  node.firstChild
    ? getFirstPlaceholderPosition(node.firstChild, currentPos + 1)
    : currentPos;

export type PlaceholderOption = string | (() => HTMLElement);

export const createPlaceholderDecos = (placeholder: PlaceholderOption) => {
  const getPlaceholder =
    typeof placeholder === "string"
      ? getDefaultPlaceholder(placeholder)
      : placeholder;

  return ({ doc }: { doc: Node }) => {
    if (doc.textContent) {
      return DecorationSet.empty;
    }

    // If the document contains inline content only, just place the widget at its start.
    const pos = doc.inlineContent ? 0 : getFirstPlaceholderPosition(doc);
    return DecorationSet.create(doc, [Decoration.widget(pos, getPlaceholder)]);
  };
};

export const createPlaceholderPlugin = (text: PlaceholderOption) =>
  new Plugin({
    props: {
      decorations: createPlaceholderDecos(text),
    },
  });
