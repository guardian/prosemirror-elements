import { Node } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { Mapping, StepMap, Transform } from "prosemirror-transform";
import { keymap } from "prosemirror-keymap";
import { undo, redo } from "prosemirror-history";
import { exampleSetup } from "prosemirror-example-setup";

import { mySchema } from "./";

export class RTENodeView {
  private dom = document.createElement("div");
  private innerView: EditorView | undefined;
  private decorations: DecorationSet;

  constructor(
    private node: Node,
    private outerView: EditorView,
    private getPos: () => number,
    private offset: number,
    decorations: Decoration[]
  ) {
    this.applyDecorations(decorations);
    this.innerView = new EditorView(this.dom, {
      state: EditorState.create({
        doc: this.node,
        plugins: [
          keymap({
            "Mod-z": () => undo(this.outerView.state, this.outerView.dispatch),
            "Mod-y": () => redo(this.outerView.state, this.outerView.dispatch),
          }),
          ...exampleSetup({ schema: mySchema }),
        ],
      }),
      // Defer state management to this class
      dispatchTransaction: this.dispatchInner.bind(this),
      decorations: () => {
        console.log(this.decorations);
        return this.decorations;
      },
    });
  }

  close() {
    if (!this.innerView) {
      return;
    }
    this.innerView.destroy();
    this.innerView = undefined;
    this.dom.textContent = "";
  }
  // }
  // nodeview_dispatchInner{
  dispatchInner(tr: Transaction) {
    if (!this.innerView) {
      return;
    }

    const { state, transactions } = this.innerView.state.applyTransaction(tr);
    this.innerView.updateState(state);

    if (!tr.getMeta("fromOutside")) {
      let outerTr = this.outerView.state.tr;
      let offsetMap = StepMap.offset(this.getPos() + this.offset + 2);
      for (let i = 0; i < transactions.length; i++) {
        let steps = transactions[i].steps;
        for (let j = 0; j < steps.length; j++)
          outerTr.step(steps[j].map(offsetMap)!);
      }
      const selection = state.selection;
      const mappedSelection = selection.map(outerTr.doc, offsetMap);

      const selectionHasChanged = !outerTr.selection.eq(mappedSelection);
      if (selectionHasChanged) {
        outerTr.setSelection(mappedSelection);
      }
      const shouldUpdateOuter = tr.docChanged || selectionHasChanged;

      if (shouldUpdateOuter) this.outerView.dispatch(outerTr);
    }
  }
  // }
  // nodeview_update{
  update(node: Node, decorations: DecorationSet, offset: number) {
    if (!node.sameMarkup(this.node)) {
      return false;
    }
    this.offset = offset;
    this.node = node;
    this.applyDecorations(decorations);

    if (this.innerView) {
      let state = this.innerView.state;
      let start = node.content.findDiffStart(state.doc.content);

      if (start != null) {
        let { a: endA, b: endB } = node.content.findDiffEnd(state.doc.content)!;
        let overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        this.innerView.dispatch(
          state.tr
            .replace(start, endB, node.slice(start, endA))
            .setMeta("fromOutside", true)
        );
      }
    }
    return true;
  }
  // }
  // nodeview_end{
  destroy() {
    if (this.innerView) this.close();
  }

  stopEvent(event: Event) {
    return (
      this.innerView && this.innerView.dom.contains(event.target as HTMLElement)
    );
  }

  private applyDecorations(decorationSet: DecorationSet) {
    const offsetMap = new Mapping([StepMap.offset(-this.offset - 1)]);
    this.decorations = decorationSet.map(offsetMap, this.node)
  }
}
