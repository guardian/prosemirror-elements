import { baseKeymap, newlineInCode } from "prosemirror-commands";
import { AttributeSpec, Node, Schema } from "prosemirror-model";
import { schema as basicSchema, marks } from "prosemirror-schema-basic";
import { DOMParser } from "prosemirror-model";
import type { Command, Plugin, Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { Mapping, StepMap } from "prosemirror-transform";
import type { DecorationSource } from "prosemirror-view";
import { DecorationSet, EditorView } from "prosemirror-view";
import type { FieldValidator } from "../elementSpec";
import type { PlaceholderOption } from "../helpers/placeholder";
import { selectAllText } from "../helpers/prosemirror";
import {
  createPlaceholderPlugin,
  PME_UPDATE_PLACEHOLDER,
} from "../helpers/placeholder";
import type { BaseFieldDescription } from "./FieldView";
import { FieldContentType, FieldView } from "./FieldView";
import { AbstractTextFieldDescription, ProseMirrorFieldView } from "./ProseMirrorFieldView";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { filteredKeymap } from "../helpers/keymap";
import { waitForNextLayout } from "../helpers/util";
import { exampleSetup } from "prosemirror-example-setup";
import { tableElement } from "../../elements/table/TableForm";
import { buildElementPlugin } from "../element";
import { createStandardElement } from "../../elements/standard/StandardForm";

type NestedOptions = {
    absentOnEmpty?: boolean;
    createPlugins?: (schema: Schema) => Plugin[];
    attrs?: Record<string, AttributeSpec>;
    content?: string;
    marks?: string;
    validators?: FieldValidator[];
    placeholder?: PlaceholderOption;
    isResizeable?: boolean;
  };
  
  export interface NestedFieldDescription extends AbstractTextFieldDescription {
    type: typeof NestedFieldView.fieldType;
    createPlugins?: (schema: Schema) => Plugin[];
    // A content expression for this node. This will override the default content expression.
    content?: string;
    // The marks permitted on this node.
    marks?: string;
    // If the text content produced by this node is an empty string, don't
    // include its key in the output data created by `getElementDataFromNode`.
    absentOnEmpty?: boolean;
  }
  
  const createCaptionPlugins = (schema: Schema) => exampleSetup({ schema });

  const mockThirdPartyTracking = (html: string) =>
  html.includes("fail")
    ? Promise.resolve({
        tracking: {
          tracks: "tracks",
        },
        reach: { unsupportedPlatforms: ["amp", "mobile"] },
      })
    : Promise.resolve({
        tracking: {
          tracks: "does-not-track",
        },
        reach: { unsupportedPlatforms: [] },
      });

  const standardElement = createStandardElement({
    createCaptionPlugins,
    checkThirdPartyTracking: mockThirdPartyTracking,
    useLargePreview: false,
  });

  export const createNestedField = ({
    absentOnEmpty,
    createPlugins,
    attrs,
    content,
    marks,
    validators,
    placeholder,
    isResizeable,
  }: NestedOptions): NestedFieldDescription => {
    const {
        plugin: elementPlugin,
        insertElement,
        nodeSpec,
        getElementDataFromNode,
      } = buildElementPlugin({
        table: tableElement,
        audio: standardElement,
    })
      
    return ({
    type: NestedFieldView.fieldType,
    createPlugins: (schema) => exampleSetup({ schema }).concat([elementPlugin]),
    attrs,
    content,
    marks,
    validators,
    absentOnEmpty,
    placeholder,
    isResizeable,
  });
}

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
      {
        placeholder,
        isResizeable,
        createPlugins,
      }: NestedFieldDescription
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- remove 'enter' commands from keymap
      const { Enter, "Mod-Enter": ModEnter, ...modifiedBaseKeymap } = baseKeymap;
      const keymapping: Record<string, Command> = {
        ...modifiedBaseKeymap,
        "Mod-z": () => undo(outerView.state, outerView.dispatch),
        "Mod-y": () => redo(outerView.state, outerView.dispatch),
        ...filteredKeymap,
      };
  
      const br = node.type.schema.nodes.hard_break;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it is possible for this to be false.
      const enableMultiline = !!br;
  
      if (enableMultiline) {
        const newLineCommand = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
            dispatch?.(
            state.tr.replaceSelectionWith(br.create()).scrollIntoView()
            );
            return true;
        };
        keymapping["Enter"] = newLineCommand;
      }
  
      keymapping["Mod-a"] = selectAllText;
  
      super(
        node,
        outerView,
        getPos,
        offset,
        decorations,
        [
            keymap(keymapping),
            ...(createPlugins ? createPlugins(node.type.schema) : []),
        ],
        placeholder,
        isResizeable
      );
  
      if (this.innerEditorView) {
        const dom = this.innerEditorView.dom as HTMLDivElement;
        dom.style.fontFamily = "serif";
        dom.style.whiteSpace = "pre-wrap";
      }
  
      if (enableMultiline) {
        // We wait to ensure that the browser has applied the appropriate styles.
        void waitForNextLayout().then(() => {
          if (!this.innerEditorView) {
            return;
          }
  
          const { lineHeight, paddingTop } = window.getComputedStyle(
            this.innerEditorView.dom
          );
  
          const domElement = this.innerEditorView.dom as HTMLDivElement;
          if (enableMultiline) {
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
          }
        });
      }
  
      this.fieldViewElement.classList.add("ProseMirrorElements__RichTextField");
    }
  }