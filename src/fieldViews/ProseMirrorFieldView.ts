import type { Node, Schema } from "prosemirror-model";
import { DOMParser, DOMSerializer } from "prosemirror-model";
import type { Plugin, Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { Mapping, StepMap } from "prosemirror-transform";
import type { Decoration } from "prosemirror-view";
import { DecorationSet, EditorView } from "prosemirror-view";
import type { FieldView } from "./FieldView";
import { FieldType } from "./FieldView";

/**
 * A FieldView that represents a
 * nested rich text editor interface.
 */
export abstract class ProseMirrorFieldView<LocalSchema extends Schema = Schema>
  implements FieldView<string> {
  public static fieldType = FieldType.CONTENT;
  public static defaultValue = "";

  // The parent DOM element for this view. Public
  // so it can be mounted by consuming elements.
  public fieldViewElement = document.createElement("div");
  // The editor view for this FieldView.
  private innerEditorView: EditorView | undefined;
  // The decorations that apply to this FieldView.
  private decorations = new DecorationSet();
  // The serialiser for the Node.
  private serialiser: DOMSerializer;
  // The parser for the Node.
  private parser: DOMParser;

  constructor(
    // The node that this FieldView is responsible for rendering.
    private node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    private outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    private getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    private offset: number,
    // The schema that the internal editor should use.
    schema: LocalSchema,
    // The initial decorations for the FieldView.
    decorations: DecorationSet | Decoration[],
    // The ProseMirror node type name
    private readonly propName: string,
    // Plugins that the editor should use
    private plugins?: Plugin[]
  ) {
    this.applyDecorationsFromOuterEditor(decorations);
    this.innerEditorView = this.createInnerEditorView(schema);
    this.serialiser = DOMSerializer.fromSchema(schema);
    this.parser = DOMParser.fromSchema(schema);
  }

  public getNodeValue(node: Node) {
    const dom = this.serialiser.serializeFragment(node.content);
    const e = document.createElement("div");
    e.appendChild(dom);
    return e.innerHTML;
  }

  public getNodeFromValue(htmlContent: string) {
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    const content = this.parser.parse(element);
    return this.node.type.create({ type: this.propName }, content);
  }

  public update(
    node: Node,
    elementOffset: number,
    decorations: DecorationSet | Decoration[]
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

    // Figure out the smallest change to the node content we need to make
    // to successfully update the inner editor, and apply it.

    const diffStart = node.content.findDiffStart(state.doc.content);

    if (diffStart === null || diffStart === undefined) {
      return;
    }

    const diffEnd = node.content.findDiffEnd(state.doc.content);
    if (!diffEnd) {
      // There's no difference between these nodes – return.
      return;
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
    transactions: Transaction[]
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

  private createInnerEditorView(schema: LocalSchema) {
    return new EditorView<LocalSchema>(this.fieldViewElement, {
      state: EditorState.create<LocalSchema>({
        doc: this.node,
        schema,
        plugins: this.plugins,
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

  private close() {
    if (!this.innerEditorView) {
      return;
    }
    this.innerEditorView.destroy();
    this.innerEditorView = undefined;
    this.fieldViewElement.textContent = "";
  }
}
