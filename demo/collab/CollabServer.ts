import {
  getVersion,
  receiveTransaction,
  sendableSteps,
} from "prosemirror-collab";
import type { Node } from "prosemirror-model";
import type { EditorState, Selection, Transaction } from "prosemirror-state";
import type { Step } from "prosemirror-transform";
import type { EditorView } from "prosemirror-view";
import {
  actionSelectionsChanged,
  COLLAB_ACTION,
  getSelectionVersion,
} from "./SelectionPlugin";

type StepsPayload = NonNullable<ReturnType<typeof sendableSteps>>;
type LocalStep = { step: Step; clientID: string };
type SelectionMap = Map<
  string,
  { selection: Selection | undefined; userName: string; version: number }
>;

export class CollabServer {
  private version = 0;
  private steps: LocalStep[] = [];
  private doc: Node | undefined;
  private selections = new Map() as SelectionMap;

  public init(doc: Node) {
    this.doc = doc;
  }

  public addSteps({ version, steps, clientID }: StepsPayload) {
    if (this.version !== version) return false;
    for (let i = 0; i < steps.length; i++) {
      if (!this.doc) break;
      this.doc = steps[i].apply(this.doc).doc ?? undefined;
    }
    this.version += steps.length;
    this.steps = this.steps.concat(
      steps.map((step) => ({ step, clientID: clientID.toString() }))
    );
  }

  public addSelection(
    selection: Selection,
    clientID: string,
    userName: string,
    version: number
  ) {
    this.selections.set(clientID, { userName, selection, version });
  }

  public getState(
    version: number
  ): { steps: LocalStep[]; selections: SelectionMap } | false {
    const startIndex = this.steps.length - (this.version - version);
    if (startIndex < 0) {
      return false;
    }

    return {
      steps: this.steps.slice(startIndex),
      selections: this.selections,
    };
  }
}

export class EditorConnection {
  private state: EditorState;
  private lastSentSelection: Selection | undefined = undefined;

  constructor(
    private view: EditorView,
    private server: CollabServer,
    private clientID: string,
    private userName: string,
    private onStateChange?: (state: EditorState) => void
  ) {
    this.state = view.state;
    // Patch `dispatchTransaction` to gather steps from local transactions,
    // and send them to the server.
    view.setProps({
      dispatchTransaction: this.dispatchTransaction,
    });
    this.startPolling();
  }

  private dispatchTransaction = (transaction: Transaction) => {
    this.state = this.state.apply(transaction);
    const steps = sendableSteps(this.state);
    const selectionHasChanged = this.state.selection !== this.lastSentSelection;
    if (steps) {
      this.addStepsFromEditor(steps);
    }
    if (selectionHasChanged) {
      this.addSelection(this.state.selection);
    }
    this.view.updateState(this.state);
    this.onStateChange?.(this.state);
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
      const selectionSpecs = Array.from(selections.entries()).map(
        ([clientID, { userName, selection, version }]) => ({
          clientID,
          userName,
          selection,
          version,
        })
      );
      tr.setMeta(COLLAB_ACTION, actionSelectionsChanged(selectionSpecs));
      this.dispatchTransaction(tr);
    }, 500000);
  }
}
