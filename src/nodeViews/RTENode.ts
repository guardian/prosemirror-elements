import { exampleSetup } from "prosemirror-example-setup";
import { redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Node, Schema } from "prosemirror-model";
import type { Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { Mapping, StepMap } from "prosemirror-transform";
import type { Decoration } from "prosemirror-view";
import { DecorationSet, EditorView } from "prosemirror-view";

/**
 * A NodeView (https://prosemirror.net/docs/ref/#view.NodeView) that represents a
 * nested rich text editor interface.
 */
export class RTENodeView<LocalSchema extends Schema> {
  // The parent DOM element for this view. Public
  // so it can be mounted by consuming elements.
  public nodeViewElement = document.createElement("div");
  // The editor view for this NodeView.
  private innerEditorView: EditorView | undefined;
  // The decorations that apply to this NodeView.
  private decorations = new DecorationSet();

  constructor(
    // The node that this NodeView is responsible for rendering.
    private node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    private outerView: EditorView,
    // Returns the current position of the parent Nodeview in the document.
    private getPos: () => number,
    // The offset of this node relative to its parent NodeView.
    private offset: number,
    // The schema that the internal editor should use.
    schema: Schema,
    // The initial decorations for the NodeView.
    decorations: DecorationSet | Decoration[]
  ) {
    this.applyDecorationsFromOuterEditor(decorations);
    this.innerEditorView = this.createInnerEditorView(schema);
  }

  public close() {
    if (!this.innerEditorView) {
      return;
    }
    this.innerEditorView.destroy();
    this.innerEditorView = undefined;
    this.nodeViewElement.textContent = "";
  }

  public update(
    node: Node,
    decorations: DecorationSet | Decoration[],
    elementOffset: number
  ) {
    if (!node.sameMarkup(this.node)) {
      return false;
    }

    this.updateInnerEditor(node, decorations, elementOffset);

    return true;
  }

  public destroy() {
    if (this.innerEditorView) this.close();
  }

  /**
   * Prevent events received in the inner editor from propagating to the outer editor.
   */
  public stopEvent(event: Event) {
    return this.innerEditorView?.dom.contains(event.target as HTMLElement);
  }

  private onInnerStateChange(tr: Transaction) {
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
  }

  private updateInnerEditor(
    node: Node,
    decorations: DecorationSet | Decoration[],
    elementOffset: number
  ) {
    this.offset = elementOffset;
    this.node = node;
    this.applyDecorationsFromOuterEditor(decorations);

    if (!this.innerEditorView) {
      return;
    }

    const state = this.innerEditorView.state;
    const start = node.content.findDiffStart(state.doc.content);

    if (start === null || start === undefined) {
      return;
    }

    const diffEnd = node.content.findDiffEnd(state.doc.content);
    if (!diffEnd) {
      return;
    }

    let { a: endA, b: endB } = diffEnd;
    const overlap = start - Math.min(endA, endB);
    if (overlap > 0) {
      endA += overlap;
      endB += overlap;
    }

    this.innerEditorView.dispatch(
      state.tr
        .replace(start, endB, node.slice(start, endA))
        .setMeta("fromOutside", true)
    );
  }

  private updateOuterEditor(
    innerTr: Transaction,
    innerState: EditorState,
    transactions: Transaction[]
  ) {
    if (typeof this.getPos === "boolean") {
      return;
    }

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

  private createInnerEditorView(schema: Schema) {
    return new EditorView<LocalSchema>(this.nodeViewElement, {
      state: EditorState.create<LocalSchema>({
        doc: this.node,
        plugins: [
          keymap({
            "Mod-z": () => undo(this.outerView.state, this.outerView.dispatch),
            "Mod-y": () => redo(this.outerView.state, this.outerView.dispatch),
          }),
          ...exampleSetup({ schema }),
        ],
      }),
      // The EditorView defers state management to this class rather than handling changes itself.
      // This lets us propagate changes to the outer EditorView when needed.
      dispatchTransaction: this.onInnerStateChange.bind(this),
      decorations: () => this.decorations,
    });
  }

  private applyDecorationsFromOuterEditor(
    decorationSet: DecorationSet | Decoration[]
  ) {
    if (!this.innerEditorView) {
      return;
    }
    const localDecoSet =
      decorationSet instanceof DecorationSet
        ? decorationSet
        : DecorationSet.create(this.node, decorationSet);
    // Offset because the node we are displaying these decorations in is a child of its parent (-1)
    const localOffset = -1;
    const offsetMap = new Mapping([StepMap.offset(-this.offset + localOffset)]);
    this.decorations = localDecoSet.map(offsetMap, this.node);
  }
}
