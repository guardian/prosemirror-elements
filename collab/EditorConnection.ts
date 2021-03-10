import {
  receiveTransaction,
  sendableSteps,
  getVersion,
} from "prosemirror-collab";
import { EditorState, Selection, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import {
  COLLAB_ACTION,
  actionSelectionsChanged,
  getSelectionVersion,
} from "./collabHelpers";
import CollabServer, { StepsPayload } from "./CollabServer";

export default class EditorConnection {
  private state: EditorState;
  private lastSentSelection: Selection | undefined = undefined;

  constructor(
    private view: EditorView,
    private server: CollabServer,
    private clientID: string,
    private userName: string,
    onDispatch: (tr: Transaction) => void
  ) {
    this.state = view.state;
    view.setProps({
      dispatchTransaction: (tr) => {
        this.dispatchTransaction(tr);
        onDispatch(tr);
      }
    });
    this.startPolling();
  }

  private dispatchTransaction = (transaction: Transaction) => {
    this.state = this.state.apply(transaction);
    const steps = sendableSteps(this.state);
    if (steps) {
      this.addStepsFromEditor(steps);
    }
    if (this.state.selection !== this.lastSentSelection) {
      this.addSelection(this.state.selection);
    }
    this.view.updateState(this.state);
  };

  private addStepsFromEditor(steps: StepsPayload) {
    this.server.addSteps(steps);
  }

  private addSelection(selection: Selection) {
    this.lastSentSelection = this.state.selection;
    const version = getSelectionVersion(this.state);
    this.server.addSelection(selection, this.clientID, this.userName, version);
  }

  public startPolling() {
    setInterval(() => {
      const version = getVersion(this.state);
      const state = this.server.getState(version);
      if (!state) {
        return console.log("Could not get steps on last poll");
      }
      const { steps, selections } = state;
      const tr = receiveTransaction(
        this.state,
        steps.map((s) => s.step),
        steps.map((s) => s.clientID)
      );
      const selectionSpecs = [...Array.from(selections.entries())].map(
        ([clientID, { userName, selection, version }]) => ({
          clientID,
          userName,
          selection,
          version,
        })
      );
      tr.setMeta(COLLAB_ACTION, actionSelectionsChanged(selectionSpecs));
      this.dispatchTransaction(tr);
    }, 500);
  }
}
