import type { Node } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { DecorationSet, EditorView } from "prosemirror-view";
import type { PlaceholderOption } from "../placeholder";
import {
  createPlaceholderPlugin,
  PME_UPDATE_PLACEHOLDER,
} from "../placeholder";
import { getDecoSpecs } from "../test";

describe("createPlaceholderDecos", () => {
  const getDecosFromView = (view: EditorView): DecorationSet =>
    // eslint-disable-next-line -- someProp always provides an `any` type.
    view.someProp("decorations")!(view.state) as DecorationSet;

  const getViewWithPlaceholderPlugin = (
    initialDoc: Node = schema.nodes.doc.create({}, schema.text("Content")),
    initialPlaceholder: PlaceholderOption = "Placeholder"
  ) => {
    const state = EditorState.create({
      doc: initialDoc,
      plugins: [createPlaceholderPlugin(initialPlaceholder)],
    });
    const view = new EditorView(null, { state });
    const decorations = getDecosFromView(view);

    return { view, decorations };
  };

  it("should not add a decoration given a contentful inline doc", () => {
    const { decorations } = getViewWithPlaceholderPlugin();
    expect(decorations).toBe(DecorationSet.empty);
  });

  it("should add a decoration given a contentless inline doc", () => {
    const doc = schema.nodes.doc.create({});
    const { decorations } = getViewWithPlaceholderPlugin(doc);
    const decoSpecs = getDecoSpecs(decorations);

    expect(decoSpecs).toEqual([{ from: 0, to: 0 }]);
  });

  it("should not add a decoration given a contentful doc with paragraphs", () => {
    const doc = schema.nodes.doc.create(
      {},
      schema.nodes.paragraph.create({}, schema.text("Content"))
    );
    const { decorations } = getViewWithPlaceholderPlugin(doc);

    expect(decorations).toBe(DecorationSet.empty);
  });

  it("should add a decoration given a contentless doc with paragraphs", () => {
    const doc = schema.nodes.doc.create({}, schema.nodes.paragraph.create({}));
    const { decorations } = getViewWithPlaceholderPlugin(doc);
    const decoSpecs = getDecoSpecs(decorations);

    expect(decoSpecs).toEqual([{ from: 1, to: 1 }]);
  });

  it("should change the decorations when we change the plugin state", () => {
    const doc = schema.nodes.doc.create({});
    const { view } = getViewWithPlaceholderPlugin(doc);
    const tr = view.state.tr.setMeta(PME_UPDATE_PLACEHOLDER, "New placeholder");

    view.dispatch(tr);

    const decorations = getDecosFromView(view);
    const decorationSpecs = decorations.find().map((decoration) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- This API is not public, but is stable, and lets us assert that our decoration contains the correct content.
      return (decoration as any).type.toDOM.textContent as string;
    });

    expect(decorationSpecs).toEqual(["New placeholder"]);
  });
});
