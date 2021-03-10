import { Step } from "prosemirror-transform";
import { sendableSteps } from "prosemirror-collab";
import { Node } from "prosemirror-model";
import { Selection } from "prosemirror-state";

export type StepsPayload = NonNullable<ReturnType<typeof sendableSteps>>;
type LocalStep = { step: Step; clientID: string };
type SelectionMap = Map<
  string,
  { selection: Selection | undefined; userName: string; version: number }
>;

export default class CollabServer {
  private version: number = 0;
  private steps: LocalStep[] = [];
  private doc: Node | undefined;
  private selections: SelectionMap = new Map();

  public init(doc: Node) {
    this.doc = doc;
  }

  public addSteps({ version, steps, clientID }: StepsPayload) {
    if (this.version !== version) return false;
    for (let i = 0; i < steps.length; i++) {
      this.doc = steps[i].apply(this.doc!).doc!;
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
    let startIndex = this.steps.length - (this.version - version);
    if (startIndex < 0) {
      return false;
    }

    return {
      steps: this.steps.slice(startIndex),
      selections: this.selections,
    };
  }
}
