import { baseKeymap } from "prosemirror-commands";
import type { AttributeSpec, Node, Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import type { DecorationSource, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import type { PlaceholderOption } from "../helpers/placeholder";
import { waitForNextLayout } from "../helpers/util";
import type { AbstractTextFieldDescription } from "./ProseMirrorFieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

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
      dom.style.fontFamily = "serif";
      dom.style.whiteSpace = "pre-wrap";
    }

    // We wait to ensure that the browser has applied the appropriate styles.
    void waitForNextLayout().then(() => {
      if (!this.innerEditorView) {
        return;
      }

      const { lineHeight, paddingTop } = window.getComputedStyle(
        this.innerEditorView.dom
      );

      const domElement = this.innerEditorView.dom as HTMLDivElement;

      const initialInputHeightPx = `${
        parseInt(lineHeight, 10) * 5 + parseInt(paddingTop) * 2
      }px`;
      domElement.style.minHeight = initialInputHeightPx;
      if (isResizeable) {
        // If the input is resizeable, assume that the user would like the input
        // to begin life with its height set to `rows`, with the opportunity to
        // expand it later.
        domElement.style.height = initialInputHeightPx;
      }
    });

    this.fieldViewElement.classList.add("ProseMirrorElements__NestedField");
  }
}