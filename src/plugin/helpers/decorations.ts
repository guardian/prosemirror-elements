import type { Node } from "prosemirror-model";
import { Mapping, StepMap } from "prosemirror-transform";
import type { DecorationSource } from "prosemirror-view";
import { DecorationSet } from "prosemirror-view";

export const getMappedDecorationsFromSet = (
  // A decoration set received, positioned relative to the outer editor. It may contain irrelevant decorations.
  decorationSet: DecorationSet,
  // The offset of the field from its containing element.
  fieldOffsetFromElement: number,
  // The node representing the current field in the ProseMirror document.
  fieldNode: Node,
  // The node representing the outer ProseMirror document containing the field.
  document: Node
) => {
  // This field may receive decorations that will not apply to its range.
  // Find the decorations in the context of the original document that should apply to this field, based on the position of
  // the decorations in the original field.
  // We must filter the decorations before we offset them via a 'map', otherwise there may be errors due to decorations
  // being mapped outside of a valid range.
  const relevantDecosFromOriginalDoc = decorationSet.find(
    fieldOffsetFromElement,
    fieldOffsetFromElement + fieldNode.nodeSize
  );
  // We must recombine the Decoration[] into a DecorationSet because we can only 'map' a DecorationSet, not a Decoration[],
  // and we want to reposition the decorations relative to the current field.
  // We must do this in the context of the original document, because ProseMirror uses the structure of the document to structure
  // the decorations - in particular Widget and Node decorations rely on the document structure for a correct DecorationSet to be
  // formed.
  const offsetMap = new Mapping([StepMap.offset(-fieldOffsetFromElement)]);
  const relevantDecosInOriginalDoc = DecorationSet.create(
    document,
    relevantDecosFromOriginalDoc
  );
  // We now 'map' the decorations based on the offset, so that they are positioned relative to the current field, rather
  // than the outer doc.
  const mappedDecorations = relevantDecosInOriginalDoc.map(
    offsetMap,
    fieldNode
  );
  return mappedDecorations;
};

export const getMappedDecorationsFromSource = (
  decorations: DecorationSource,
  fieldOffsetFromElement: number,
  fieldNode: Node,
  document: Node
): DecorationSet => {
  const relevantDecorationSets: DecorationSet[] = [];

  // Map each member DecorationSet, combine them into a single DecorationSet,
  // then set them as the field's decorations.
  decorations.forEachSet((set) => {
    const mappedDecos = getMappedDecorationsFromSet(
      set,
      fieldOffsetFromElement,
      fieldNode,
      document
    );
    relevantDecorationSets.push(mappedDecos);
  });

  const relevantDecorations = relevantDecorationSets.flatMap((set) =>
    set.find()
  );
  // Decorations may be lost if we don't recreate the DecorationSet in the context of the innerEditor
  const decorationsAsSet = DecorationSet.create(fieldNode, relevantDecorations);
  return decorationsAsSet;
};
