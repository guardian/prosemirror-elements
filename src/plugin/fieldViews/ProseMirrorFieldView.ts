import type { AttributeSpec, Node } from "prosemirror-model";
import { DOMParser } from "prosemirror-model";
import type { Plugin, Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { Mapping, StepMap } from "prosemirror-transform";
import type { DecorationSource } from "prosemirror-view";
import { DecorationSet, EditorView } from "prosemirror-view";
import type { PlaceholderOption } from "../helpers/placeholder";
import {
  createPlaceholderPlugin,
  PME_UPDATE_PLACEHOLDER,
} from "../helpers/placeholder";
import type { BaseFieldDescription } from "./FieldView";
import { FieldContentType, FieldView } from "./FieldView";

export interface AbstractTextFieldDescription
  extends BaseFieldDescription<string> {
  placeholder?: PlaceholderOption;
  // Add additional attributes to the node representing this field.
  attrs?: Record<string, AttributeSpec>;
  // If true, when this text field is empty, do not include it as a key-value pair
  // in the element data extracted with `getElementDataFromNode`.
  absentOnEmpty?: boolean;
  // Can the user resize the input?
  isResizeable?: boolean;
}

/**
 * A FieldView that represents a nested prosemirror instance.
 */
export abstract class ProseMirrorFieldView extends FieldView<string> {
  public static fieldContentType = FieldContentType.CONTENT;
  public static defaultValue = "";

  // The parent DOM element for this view. Public
  // so it can be mounted by consuming elements.
  public fieldViewElement = document.createElement("div");
  // The editor view for this FieldView.
  protected innerEditorView: EditorView | undefined;
  // The decorations that apply to this FieldView, from the perspective
  // of the inner editor.
  private decorations: DecorationSource = DecorationSet.empty;
  // The decorations that apply to this FieldView, from the perspective
  // of the outer editor. We store these to avoid unnecessary updates.
  private outerDecorations = undefined as DecorationSource | undefined;
  // Do we have a change in our decorations that is yet to be rendered?
  private decorationsPending = false;
  // The parser for the Node.
  private parser: DOMParser;

  constructor(
    // The node that this FieldView is responsible for rendering.
    public node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    private outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    private getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    public offset: number,
    // The initial decorations for the FieldView.
    decorations: DecorationSource,
    // Plugins that the editor should use
    plugins?: Plugin[],
    // The field placeholder option
    placeholder?: PlaceholderOption,
    // Is this text field resizeable?
    isResizeable = false
  ) {
    super();

    this.applyDecorationsFromOuterEditor(decorations, node, offset);
    this.setupFocusHandler();
    this.parser = DOMParser.fromSchema(node.type.schema);

    const localPlugins = placeholder
      ? [...(plugins ?? []), createPlaceholderPlugin(placeholder)]
      : plugins;
    this.innerEditorView = this.createInnerEditorView(localPlugins);
    if (isResizeable) {
      this.makeInputElementResizeable();
    }
  }

  public onUpdate(
    node: Node,
    elementOffset: number,
    decorations: DecorationSource
  ) {
    if (!node.hasMarkup(this.node.type)) {
      return false;
    }

    this.updateInnerEditor(node, decorations, elementOffset);

    return true;
  }

  public update(value: string) {
    if (!this.innerEditorView) {
      return;
    }

    const node = this.getNodeFromValue(value);
    const tr = this.innerEditorView.state.tr;
    tr.replaceWith(0, this.innerEditorView.state.doc.content.size, node);
    this.dispatchTransaction(tr);
  }

  public updatePlaceholder(value: PlaceholderOption) {
    this.innerEditorView?.dispatch(
      this.innerEditorView.state.tr.setMeta(PME_UPDATE_PLACEHOLDER, value)
    );
  }

  public destroy() {
    if (this.innerEditorView) this.close();
  }

  private dispatchTransaction(tr: Transaction) {
    if (!this.innerEditorView) {
      return;
    }

    const { state, transactions } = this.innerEditorView.state.applyTransaction(
      tr
    );

    // Applying the outer state first ensures that decorations in the parent
    // view are correctly mapped through this transaction by the time they're
    // accessed by the innerEditorView.
    if (!tr.getMeta("fromOutside")) {
      this.updateOuterEditor(tr, state, transactions);
    }

    this.innerEditorView.updateState(state);

    this.decorationsPending = false;
  }

  private updateInnerEditor(
    node: Node,
    decorations: DecorationSource,
    elementOffset: number
  ) {
    if (!this.innerEditorView) {
      return;
    }

    this.offset = elementOffset;
    this.node = node;
    this.applyDecorationsFromOuterEditor(decorations, node, elementOffset);

    const state = this.innerEditorView.state;

    // Figure out the smallest change to the node content we need to make
    // to successfully update the inner editor, and apply it.

    const diffStart = node.content.findDiffStart(state.doc.content);

    if (diffStart === null) {
      return this.maybeRerenderDecorations();
    }

    const diffEnd = node.content.findDiffEnd(state.doc.content);
    if (!diffEnd) {
      // There's no difference between these nodes.
      return this.maybeRerenderDecorations();
    }

    let { a: endOfOuterDiff, b: endOfInnerDiff } = diffEnd;

    // This overlap accounts for a situation where we're diffing nodes where we encounter
    // identical content.
    //
    // For example, if the inner node has content 'a', and the outer node has content 'aa',
    // `diffStart` sees (numbers are positions, ^ denotes the value found by the method)
    //
    // ab    inner node
    // abb   outer node
    // 123
    //   ^
    //
    // `diffEnd` for the inner node is
    //  ab   inner node
    // abb   outer node
    // 123
    //  ^
    //
    // But 2 is not the correct end of the diff. The correct diff is (3, 3).
    //
    // This happens because `findDiffEnd` finds the first point at which the content differs,
    // starting from the end of the nodes. So if we encounter identical content, the diff will
    // be shorter by the length of the identical content we encounter – or the overlap between
    // the two nodes from the point of view of the diff.
    const overlap = diffStart - Math.min(endOfOuterDiff, endOfInnerDiff);
    if (overlap > 0) {
      endOfOuterDiff += overlap;
      endOfInnerDiff += overlap;
    }

    this.innerEditorView.dispatch(
      state.tr
        .replace(
          diffStart,
          endOfInnerDiff,
          node.slice(diffStart, endOfOuterDiff)
        )
        .setMeta("fromOutside", true)
    );
  }

  private updateOuterEditor(
    innerTr: Transaction,
    innerState: EditorState,
    transactions: readonly Transaction[]
  ) {
    const outerTr = this.outerView.state.tr;
    // When we insert content, we must offset to account for a few things:
    //  - getPos() returns the position directly before the parent node (+1)
    //  - the node we will be altering is a child of its parent (+1)
    const contentOffset = 2;
    const offsetMap = StepMap.offset(
      this.getPos() + this.offset + contentOffset
    );
    for (let i = 0; i < transactions.length; i++) {
      const steps = transactions[i].steps;
      for (let j = 0; j < steps.length; j++) {
        const mappedStep = steps[j].map(offsetMap);
        if (mappedStep) {
          outerTr.step(mappedStep);
        }
      }
    }

    const selection = innerState.selection;
    const mappedSelection = selection.map(outerTr.doc, offsetMap);

    const selectionHasChanged = !outerTr.selection.eq(mappedSelection);
    if (selectionHasChanged) {
      outerTr.setSelection(mappedSelection);
    }

    const shouldUpdateOuter = innerTr.docChanged || selectionHasChanged;
    if (shouldUpdateOuter) this.outerView.dispatch(outerTr);
  }

  private createInnerEditorView(plugins?: Plugin[]) {
    const view = new EditorView(this.fieldViewElement, {
      state: EditorState.create({
        doc: this.node,
        plugins,
      }),
      // The EditorView defers state management to this class rather than handling changes itself.
      // This lets us propagate changes to the outer EditorView when needed.
      dispatchTransaction: this.dispatchTransaction.bind(this),
      decorations: () => this.decorations,
    });

    view.dom.id = this.getId();
    view.dom.setAttribute("aria-labelledby", `label-${this.getId()}`);

    return view;
  }

  private applyDecorationsFromOuterEditor(
    decorationSet: DecorationSource,
    node: Node,
    elementOffset: number
  ) {
    // Do nothing if the decorations have not changed.
    if (decorationSet === this.outerDecorations) {
      return;
    }
    this.outerDecorations = decorationSet;
    const localDecoSet = Array.isArray(decorationSet)
      ? DecorationSet.create(node, decorationSet)
      : decorationSet;
    // Offset because the node we are displaying these decorations in is a child of its parent (-1)
    const localOffset = -1;
    const offsetMap = new Mapping([
      StepMap.offset(-elementOffset + localOffset),
    ]);
    this.decorations = localDecoSet.map(offsetMap, node);
    this.decorationsPending = true;
  }

  /**
   * If the incoming decorations are different from the current decorations, rerender them.
   * Useful to force a rerender when the decorations have changed, but there's no diff to
   * produce a brand new editor state.
   */
  private maybeRerenderDecorations() {
    if (this.decorationsPending && this.innerEditorView) {
      // This empty transaction forces the editor to rerender its decorations.
      this.innerEditorView.dispatch(
        this.innerEditorView.state.tr.setMeta("fromOutside", true)
      );
    }
  }

  private makeInputElementResizeable() {
    if (!this.innerEditorView) {
      return;
    }
    (this.innerEditorView.dom as HTMLDivElement).style.resize = "vertical";
    (this.innerEditorView.dom as HTMLDivElement).style.overflow = "auto";
  }

  /**
   * We need to set the appropriate selection in the parent editor when this
   * field is focused. ProseMirror does not dispatch a transaction when it
   * receives focus on a document and the selection state doesn't change, so in
   * that case we do this manually.
   *
   * This can result in two selection transactions being dispatched in quick
   * succession when users focus this field and the selection state _has_
   * changed. This is difficult to work around, because we cannot know what the
   * user selection is until ProseMirror has resolved it. We haven't observed
   * any problems as a result of this behaviour yet, but it's worth noting.
   */
  private setupFocusHandler() {
    this.fieldViewElement.addEventListener("focusin", () => {
      if (!this.innerEditorView) {
        return;
      }

      const { tr } = this.innerEditorView.state;
      tr.setSelection(this.innerEditorView.state.selection);
      // Setting a text selection seems to clear out our stored marks,
      // so we must add them to the transaction explicitly.
      tr.setStoredMarks(this.innerEditorView.state.storedMarks ?? []);

      this.dispatchTransaction(tr);
    });
  }

  private close() {
    if (!this.innerEditorView) {
      return;
    }
    this.innerEditorView.destroy();
    this.innerEditorView = undefined;
    this.fieldViewElement.textContent = "";
  }

  private getNodeFromValue(htmlContent: string) {
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    const topNode = this.node.type.create({
      type: this.node.attrs.type as string,
    });
    return this.parser.parse(element, { topNode });
  }
}
