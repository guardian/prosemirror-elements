import { exampleSetup } from "prosemirror-example-setup";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Node, NodeSpec, Schema } from "prosemirror-model";
import type { EditorState, Plugin, Transaction } from "prosemirror-state";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import type { BaseFieldDescription } from "./FieldView";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export interface RichTextFieldDescription extends BaseFieldDescription<string> {
  type: typeof RichTextFieldView.fieldName;
  createPlugins?: (schema: Schema) => Plugin[];
  nodeSpec?: Partial<NodeSpec>;
  // If the text content produced by this node is an empty string, don't
  // include its key in the output data created by `getElementDataFromNode`.
  absentOnEmpty?: boolean;
}

type RichTextOptions = {
  createPlugins?: (schema: Schema) => Plugin[];
  nodeSpec?: Partial<NodeSpec>;
  validators?: FieldValidator[];
};

export const createRichTextField = ({
  createPlugins,
  nodeSpec,
  validators,
}: RichTextOptions): RichTextFieldDescription => ({
  type: RichTextFieldView.fieldName,
  createPlugins,
  nodeSpec,
  validators,
});

type FlatRichTextOptions = RichTextOptions & {
  nodeSpec?: Partial<Omit<NodeSpec, "content">>;
  validators?: FieldValidator[];
};

/**
 * Create a rich text field that contains only text (no p tag). Lines
 * are separated by line breaks (`<br>` tags).
 */
export const createFlatRichTextField = ({
  createPlugins,
  nodeSpec,
  validators,
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
    nodeSpec: {
      ...nodeSpec,
      content: "(text|hard_break)*",
    },
    validators,
  });

/**
 * Create a rich text field with a default setup. Largely for demonstrative
 * purposes, as library users are likely to want different defaults.
 */
export const createDefaultRichTextField = (
  validators?: FieldValidator[]
): RichTextFieldDescription =>
  createRichTextField({
    createPlugins: (schema) => exampleSetup({ schema }),
    validators,
  });

export class RichTextFieldView extends ProseMirrorFieldView {
  public static fieldName = "richText" as const;

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
    decorations: DecorationSet | Decoration[],
    // The plugins passed by the consumer into the FieldView, if any.
    plugins: Plugin[]
  ) {
    super(
      node,
      outerView,
      getPos,
      offset,
      decorations,
      RichTextFieldView.fieldName,
      [
        keymap({
          "Mod-z": () => undo(outerView.state, outerView.dispatch),
          "Mod-y": () => redo(outerView.state, outerView.dispatch),
        }),
        ...plugins,
      ]
    );

    this.fieldViewElement.classList.add("ProseMirrorElements__RichTextField");
  }
}
