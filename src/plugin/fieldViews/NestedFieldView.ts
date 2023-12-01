import type { AttributeSpec, Node } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import type { DecorationSource, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import type { PlaceholderOption } from "../helpers/placeholder";
import type { AbstractTextFieldDescription } from "./ProseMirrorFieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";
import { FieldContentType } from "./FieldView";

type NestedOptions = {
  absentOnEmpty?: boolean;
  attrs?: Record<string, AttributeSpec>;
  content?: string;
  marks?: string;
  validators?: FieldValidator[];
  placeholder?: PlaceholderOption;
  isResizeable?: boolean;
};

export interface NestedFieldDescription extends AbstractTextFieldDescription {
  type: typeof NestedFieldView.fieldType;
  // A content expression for this node. This will override the default content expression.
  content?: string;
  // The marks permitted on this node.
  marks?: string;
  // If the text content produced by this node is an empty string, don't
  // include its key in the output data created by `getElementDataFromNode`.
  absentOnEmpty?: boolean;
}

export const createNestedField = ({
  absentOnEmpty,
  attrs,
  content,
  marks,
  validators,
  placeholder,
  isResizeable,
}: NestedOptions): NestedFieldDescription => {
  return {
    type: NestedFieldView.fieldType,
    attrs,
    content,
    marks,
    validators,
    absentOnEmpty,
    placeholder,
    isResizeable,
  };
};

export class NestedFieldView extends ProseMirrorFieldView {
  public static fieldType = "nested" as const;
  public static fieldContentType = FieldContentType.NESTED;

  constructor(
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    offset: number,
    // The initial decorations for the FieldView.
    decorations: DecorationSource,
    { placeholder, isResizeable }: NestedFieldDescription
  ) {
    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      outerView.state.plugins as Plugin[],
      placeholder,
      isResizeable
    );

    if (this.innerEditorView) {
      const dom = this.innerEditorView.dom as HTMLDivElement;
    }
    this.fieldViewElement.classList.add("ProseMirrorElements__NestedField");
  }
}
