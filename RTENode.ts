import { Node } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { StepMap, Transform } from "prosemirror-transform";
import { keymap } from "prosemirror-keymap";
import { undo, redo } from "prosemirror-history";
import { exampleSetup } from 'prosemirror-example-setup';

import { mySchema}from './'

export class RTENode {
  private dom = document.createElement("div");
  private innerView: EditorView | undefined;

  constructor(
    private node: Node,
    private outerView: EditorView,
    private getPos: () => number,
    private offset: number
  ) {
    this.innerView = new EditorView(this.dom, {
      state: EditorState.create({
        doc: this.node,
        plugins: [
          keymap({
            "Mod-z": () => undo(this.outerView.state, this.outerView.dispatch),
            "Mod-y": () => redo(this.outerView.state, this.outerView.dispatch),
          }),
          ...exampleSetup({ schema: mySchema })
        ],
      }),
      // Defer state management to this class
      dispatchTransaction: this.dispatchInner.bind(this)
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
    let { state, transactions } = this.innerView.state.applyTransaction(tr);
    this.innerView.updateState(state);

    if (!tr.getMeta("fromOutside")) {
      let outerTr = this.outerView.state.tr,
        offsetMap = StepMap.offset(this.getPos() + this.offset + 2);
      for (let i = 0; i < transactions.length; i++) {
        let steps = transactions[i].steps;
        for (let j = 0; j < steps.length; j++)
          outerTr.step(steps[j].map(offsetMap)!);
      }
      if (outerTr.docChanged) this.outerView.dispatch(outerTr);
    }
  }
  // }
  // nodeview_update{
  update(node: Node, offset: number) {
    if (!node.sameMarkup(this.node)) {
      return false;
    }
    this.offset = offset;
    this.node = node;
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

  ignoreMutation() {
    return true;
  }
}
