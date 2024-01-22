import { exampleSetup } from "prosemirror-example-setup";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { AttributeSpec, Node, Schema } from "prosemirror-model";
import type { EditorState, Plugin, Transaction } from "prosemirror-state";
import type { DecorationSource, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import { filteredKeymap } from "../helpers/keymap";
import type { PlaceholderOption } from "../helpers/placeholder";
import { createPlaceholderPlugin } from "../helpers/placeholder";
import { selectAllText } from "../helpers/prosemirror";
import type { AbstractTextFieldDescription } from "./ProseMirrorFieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export interface RichTextFieldDescription extends AbstractTextFieldDescription {
  type: typeof RichTextFieldView.fieldType;
  createPlugins?: (schema: Schema) => Plugin[];
  // A content expression for this node. This will override the default content expression.
  content?: string;
  // The marks permitted on this node.
  marks?: string;
  // If the text content produced by this node is an empty string, don't
  // include its key in the output data created by `getElementDataFromNode`.
  absentOnEmpty?: boolean;
}

type RichTextOptions = {
  absentOnEmpty?: boolean;
  createPlugins?: (schema: Schema) => Plugin[];
  attrs?: Record<string, AttributeSpec>;
  content?: string;
  marks?: string;
  validators?: FieldValidator[];
  placeholder?: PlaceholderOption;
  isResizeable?: boolean;
};

export const createRichTextField = ({
  absentOnEmpty,
  createPlugins,
  attrs,
  content,
  marks,
  validators,
  placeholder,
  isResizeable,
}: RichTextOptions): RichTextFieldDescription => ({
  type: RichTextFieldView.fieldType,
  createPlugins,
  attrs,
  content,
  marks,
  validators,
  absentOnEmpty,
  placeholder,
  isResizeable,
});

type FlatRichTextOptions = RichTextOptions & {
  validators?: FieldValidator[];
  placeholder?: string;
};

/**
 * Create a rich text field that contains only text (no p tag). Lines
 * are separated by line breaks (`<br>` tags).
 */
export const createFlatRichTextField = ({
  createPlugins,
  ...rest
}: FlatRichTextOptions): RichTextFieldDescription =>
  createRichTextField({
    createPlugins: (schema) => {
      const br = schema.nodes.hard_break;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- there's no guarantee this is present in the Schema.
      if (!br) {
        throw new Error(
          "[prosemirror-elements]: Attempted to add a FlatRichTextField, but there was no hard_break node in the schema. You must supply one to use this field."
        );
      }

      const keymapping = {
        Enter: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          dispatch?.(
            state.tr.replaceSelectionWith(br.create()).scrollIntoView()
          );
          return true;
        },
      };

      const plugin = keymap(keymapping);
      return [plugin, ...(createPlugins?.(schema) ?? [])];
    },
    content: "(text|hard_break)*",
    ...rest,
  });

/**
 * Create a rich text field with a default setup. Largely for demonstrative
 * purposes, as library users are likely to want different defaults.
 */
export const createDefaultRichTextField = (
  validators?: FieldValidator[],
  placeholder?: string
): RichTextFieldDescription =>
  createRichTextField({
    createPlugins: (schema) => exampleSetup({ schema }),
    validators,
    placeholder: placeholder ?? "",
  });

export class RichTextFieldView extends ProseMirrorFieldView {
  public static fieldType = "richText" as const;

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
    { placeholder, isResizeable, createPlugins }: RichTextFieldDescription
  ) {
    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      [
        keymap({
          "Mod-z": () => undo(outerView.state, outerView.dispatch),
          "Mod-y": () => redo(outerView.state, outerView.dispatch),
          "Mod-a": selectAllText,
          ...filteredKeymap,
        }),
        createPlaceholderPlugin(placeholder ?? "Enter text..."),
        ...(createPlugins ? createPlugins(node.type.schema) : []),
      ],
      placeholder,
      isResizeable
    );

    this.fieldViewElement.classList.add("ProseMirrorElements__RichTextField");
  }
}
