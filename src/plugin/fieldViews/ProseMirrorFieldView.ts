import { isEqual } from "lodash";
import { DOMParser } from "prosemirror-model";
import type { AttributeSpec, Mark, Node } from "prosemirror-model";
import type { Plugin, Selection, Transaction } from "prosemirror-state";
import { EditorState } from "prosemirror-state";
import { Mapping, StepMap } from "prosemirror-transform";
import type { DecorationSource, EditorProps } from "prosemirror-view";
import { DecorationSet, EditorView } from "prosemirror-view";
import type { PlaceholderOption } from "../helpers/placeholder";
import { PME_UPDATE_PLACEHOLDER } from "../helpers/placeholder";
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

// This class isn't made available by prosemirror-view - we should request a change there
declare class DecorationGroup implements DecorationSource {
  readonly members: readonly DecorationSet[];
  constructor(members: readonly DecorationSet[]);
  map(mapping: Mapping, doc: Node): DecorationSource;
  forChild(offset: number, child: Node): DecorationSource | DecorationSet;
  eq(other: DecorationGroup): boolean;
  locals(node: Node): readonly any[];
  static from(members: readonly DecorationSource[]): DecorationSource;
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
  protected decorations: DecorationSource = DecorationSet.empty;
  // The decorations that apply to this FieldView, from the perspective
  // of the outer editor. We store these to avoid unnecessary updates.
  protected outerDecorations = undefined as DecorationSource | undefined;
  // Do we have a change in our decorations that is yet to be rendered?
  protected decorationsPending = false;
  // The parser for the Node.
  private parser: DOMParser;

  constructor(
    // The node that this FieldView is responsible for rendering.
    public node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    private outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    protected getPos: () => number,
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

    this.applyDecorationsFromOuterEditor(
      decorations,
      node,
    );
    this.setupFocusHandler();
    this.parser = DOMParser.fromSchema(node.type.schema);

    this.innerEditorView = this.createInnerEditorView(plugins);
    if (isResizeable) {
      this.makeInputElementResizeable();
    }
  }

  public onUpdate(
    node: Node,
    elementOffset: number,
    decorations: DecorationSource,
    selection?: Selection,
    storedMarks?: readonly Mark[] | null
  ) {
    if (!node.hasMarkup(this.node.type)) {
      return false;
    }

    this.updateInnerEditor(
      node,
      decorations,
      elementOffset,
      selection,
      storedMarks
    );

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

    this.innerEditorView.updateState(state);
    this.decorationsPending = false;

    if (!tr.getMeta("fromOutside")) {
      this.updateOuterEditor(tr, state, transactions);
    }
  }

  private updateInnerEditor(
    node: Node,
    decorations: DecorationSource,
    elementOffset: number,
    selection?: Selection,
    storedMarks?: readonly Mark[] | null
  ) {
    if (!this.innerEditorView) {
      return;
    }

    this.offset = elementOffset;
    this.node = node;
     // Absolute position of the field in the document
    // Note: we must offset to account for a few things:
    //  - getPos() returns the position directly before the parent node (+1)
    //  - the node we will be altering is a child of its parent (+1)
    const contentOffset = 2;
    const fieldStart = this.offset + this.getPos() + contentOffset;
    const fieldEnd =
      this.offset + this.getPos() + this.innerEditorView.state.doc.nodeSize;

    this.applyDecorationsFromOuterEditor(
      decorations,
      node,
    );
    const state = this.innerEditorView.state;
    let shouldDispatchTransaction = false;
    let tr = state.tr;

    // Check if the inner selection needs to be updated

    if (selection) {
      // Absolute positions of the incoming selection
      const incomingAnchorPos = selection.$anchor.pos;
      const incomingHeadPos = selection.$head.pos;

      // Relative positions of the current selection in the inner editor
      const currentAnchorPos = this.innerEditorView.state.selection.$anchor.pos;
      const currentHeadPos = this.innerEditorView.state.selection.$head.pos;

      const incomingSelectionIsWithinThisField =
        incomingAnchorPos > fieldStart &&
        incomingAnchorPos < fieldEnd &&
        incomingHeadPos > fieldStart &&
        incomingHeadPos < fieldEnd;

      // The inner editor's selection will be offset relative to the start of this field,
      // compared to the incoming selection
      const incomingSelectionDiffersFromCurrentSelection =
        currentAnchorPos !== incomingAnchorPos - fieldStart ||
        currentHeadPos !== incomingHeadPos - fieldStart;

      if (
        incomingSelectionIsWithinThisField &&
        incomingSelectionDiffersFromCurrentSelection
      ) {
        const offsetMap = StepMap.offset(-fieldStart);
        const mappedSelection = selection.map(state.tr.doc, offsetMap);
        shouldDispatchTransaction = true;
        tr = tr.setSelection(mappedSelection);
      }
    }

    // Check if the passed-in Node is different to the existing content,
    // figure out the smallest change to the node content we need to make to
    // successfully update the inner editor, and apply it.

    const diffStart = node.content.findDiffStart(state.doc.content);
    const diffEnd = node.content.findDiffEnd(state.doc.content);

    // Check for null specifically, rather than falsiness, because a diff starting at pos 0 is a valid diff
    if (diffStart !== null && diffEnd !== null) {
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

      shouldDispatchTransaction = true;

      tr = tr.replace(
        diffStart,
        endOfInnerDiff,
        node.slice(diffStart, endOfOuterDiff)
      );
    }

    const storedMarksHaveChanged = !isEqual(
      storedMarks,
      this.innerEditorView.state.storedMarks
    );

    if (storedMarksHaveChanged && storedMarks !== undefined) {
      shouldDispatchTransaction = true;
      tr = tr.setStoredMarks(storedMarks);
    }

    if (shouldDispatchTransaction) {
      tr = tr.setMeta("fromOutside", true);
      this.innerEditorView.dispatch(tr);
    } else {
      return this.maybeRerenderDecorations();
    }
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

    if (innerTr.getMeta("paste") === true) {
      // Pass the "paste" meta specifically, because we know it's needed by
      // another plugin to handle pastes - meta values won't be transferred
      // to the outerTr unless we set them.
      outerTr.setMeta("paste", true);
    }

    const storedMarksHaveChanged = !isEqual(
      this.outerView.state.storedMarks,
      innerTr.storedMarks
    );

    if (storedMarksHaveChanged) {
      outerTr.setStoredMarks(innerTr.storedMarks);
    }

    const shouldUpdateOuter =
      innerTr.docChanged || selectionHasChanged || storedMarksHaveChanged;
    if (shouldUpdateOuter) this.dispatchToOuterView(outerTr);
  }

  protected dispatchToOuterView(tr: Transaction) {
    this.outerView.dispatch(tr);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- default implementation
  protected getInnerEditorPropsOverrides(outerView: EditorView): EditorProps {
    return {};
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

      ...this.getInnerEditorPropsOverrides(this.outerView),
    });

    view.dom.id = this.getId();
    view.dom.setAttribute("aria-labelledby", `label-${this.getId()}`);

    return view;
  }

  private setDecorationsForEditor(
    decorations: DecorationSet,
  ){
    this.decorations = decorations;
    this.decorationsPending = true;
  }

  private getMappedDecorationsFromSet(
    // A decoration set received, positioned relative to the outer editor. It may contain irrelevant decorations.
    decorationSet: DecorationSet,
    // The offset of the field from its containing element
    fieldOffsetFromElement: number,
    // The node representing the current field in the ProseMirror document.
    fieldNode: Node 
  ){
    // This field may receive decorations that will not apply to its range.
    // Find the decorations in the context of the original document that should apply to this field, based on the position of
    // the decorations in the original field.
    // We must filter the decorations before we offset them via a 'map', otherwise there may be errors due to decorations
    // being mapped outside of a valid range.
    const relevantDecosFromOriginalDoc = decorationSet.find(fieldOffsetFromElement, fieldOffsetFromElement + fieldNode.nodeSize);
    // We must recombine the Decoration[] into a DecorationSet because we can only 'map' a DecorationSet, not a Decoration[], 
    // and we want to reposition the decorations relative to the current field.
    // We must do this in the context of the original document, because ProseMirror uses the structure of the document to structure
    // the decorations - in particular Widget and Node decorations rely on the document structure for a correct DecorationSet to be 
    // formed.
    const offsetMap = new Mapping([StepMap.offset(-fieldOffsetFromElement)]);
    const relevantDecosInOriginalDoc = DecorationSet.create(this.outerView.state.doc, relevantDecosFromOriginalDoc)
    // We now 'map' the decorations based on the offset, so that they are positioned relative to the current field, rather
    // than the outer doc.
    const mappedDecorations = relevantDecosInOriginalDoc.map(offsetMap, fieldNode);
    return mappedDecorations
  }

  protected applyDecorationsFromOuterEditor(
    decorations: DecorationSource | DecorationSet | DecorationGroup,
    fieldNode: Node,
  ) {
    // Do nothing if the decorations have not changed.
    if (decorations === this.outerDecorations) {
      return;
    }

    this.outerDecorations = decorations;
    // The incoming decorations are positioned relative to the parent NodeView, so we only
    // need to consider the offset of this field from its parent NodeView, and can ignore
    // the offset of the parent from the outer editor's document.
    // The node we will be altering is a child of its parent, so we add +1 to the offset.
    const fieldOffsetFromElement = this.offset + 1;

    if ("find" in decorations) {
      // 'decorations' is a DecorationSet. Map them, then set them as the field's decorations.
      const relevantDecorationSet = this.getMappedDecorationsFromSet(decorations, fieldOffsetFromElement, fieldNode);
      this.setDecorationsForEditor(relevantDecorationSet);
    } else if ("members" in decorations) {
      // 'decorations' is a DecorationGroup. Map each member DecorationSet, combine them into a single DecorationSet,
      // then set them as the field's decorations.
      const relevantDecorations = decorations.members.map(decorationSet =>
        this.getMappedDecorationsFromSet(decorationSet, fieldOffsetFromElement, fieldNode)
      ).flatMap((set) =>
        set.find()
      );
      const decorationsAsSet = DecorationSet.create(fieldNode, relevantDecorations);
      this.setDecorationsForEditor(decorationsAsSet);
    }
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
    return this.parser.parse(element, { topNode: this.node });
  }
}
