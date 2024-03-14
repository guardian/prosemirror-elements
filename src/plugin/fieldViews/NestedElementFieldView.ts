import type { AttributeSpec, Node } from "prosemirror-model";
import type { PluginKey } from "prosemirror-state";
import type { DecorationSource, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import { pluginKey } from "../helpers/constants";
import type { PlaceholderOption } from "../helpers/placeholder";
import { waitForNextLayout } from "../helpers/util";
import { FieldContentType } from "./FieldView";
import type { AbstractTextFieldDescription } from "./ProseMirrorFieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

type NestedElementOptions = {
  absentOnEmpty?: boolean;
  attrs?: Record<string, AttributeSpec>;
  content?: string;
  marks?: string;
  validators?: FieldValidator[];
  placeholder?: PlaceholderOption;
  isResizeable?: boolean;
  allowedPlugins?: PluginKey[];
  minRows?: number;
};

export interface NestedElementFieldDescription
  extends AbstractTextFieldDescription {
  type: typeof NestedElementFieldView.fieldType;
  // A content expression for this node. This will override the default content expression.
  content?: string;
  // The marks permitted on this node.
  marks?: string;
  // If the text content produced by this node is an empty string, don't
  // include its key in the output data created by `getElementDataFromNode`.
  absentOnEmpty?: boolean;
  allowedPlugins?: PluginKey[];
  minRows?: number;
}

export const anyDescendantFieldIsNestedElementField = (node: Node) => {
  let descendantFieldIsNestedElementField = false;
  node.descendants((node) => {
    if (node.type.spec.content === "element+") {
      descendantFieldIsNestedElementField = true;
    }
  });
  return descendantFieldIsNestedElementField;
};

export const createNestedElementField = ({
  absentOnEmpty,
  attrs,
  content,
  marks,
  validators,
  placeholder,
  isResizeable,
  allowedPlugins = [],
  minRows = 4,
}: NestedElementOptions): NestedElementFieldDescription => {
  return {
    type: NestedElementFieldView.fieldType,
    attrs,
    content,
    marks,
    validators,
    absentOnEmpty,
    placeholder,
    isResizeable,
    allowedPlugins,
    minRows,
  };
};

export const INNER_EDITOR_FOCUS = "innerEditorFocus";
export const INNER_EDITOR_BLUR = "innerEditorBlur";

const synthesizeEvent = (eventName: string) => {
  return new CustomEvent(eventName, {
    bubbles: true,
  });
};

/**
 * A FieldView representing a node that can contain elements.
 */
export class NestedElementFieldView extends ProseMirrorFieldView {
  public static fieldType = "nestedElement" as const;
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
    { placeholder, isResizeable, minRows }: NestedElementFieldDescription,
    // Specify plugins of which the field should have its own copy
    allowedPlugins: PluginKey[] = []
  ) {
    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      outerView.state.plugins.filter((plugin) =>
        plugin.spec.key === undefined
          ? true
          : [pluginKey, ...allowedPlugins].includes(plugin.spec.key)
      ),
      placeholder,
      isResizeable
    );

    if (this.innerEditorView) {
      const dom = this.innerEditorView.dom as HTMLDivElement;
      // We publish two custom events here on focus and blur so that the containing ProseMirror editor
      // using the prosemirror-elements plugin can track the focus state of nestedElement fields -
      // this can be used by the containing editor to e.g. manage menu visibility when nested element
      // fields are focused.
      dom.addEventListener("focus", (e: Event) =>
        e.target?.dispatchEvent(synthesizeEvent(INNER_EDITOR_FOCUS))
      );
      dom.addEventListener("blur", (e: Event) =>
        e.target?.dispatchEvent(synthesizeEvent(INNER_EDITOR_BLUR))
      );

      void waitForNextLayout().then(() => {
        if (!this.innerEditorView) {
          return;
        }

        const { lineHeight, paddingTop } = window.getComputedStyle(
          this.innerEditorView.dom
        );
        const domElement = this.innerEditorView.dom as HTMLDivElement;
        if (minRows) {
          const initialInputHeightPx = `${
            parseInt(lineHeight, 10) * minRows + parseInt(paddingTop) * 2
          }px`;
          domElement.style.minHeight = initialInputHeightPx;
        }
      });
    }
    this.fieldViewElement.classList.add(
      "ProseMirrorElements__NestedElementField"
    );
  }
}
