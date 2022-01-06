import type { Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { createElementSpec } from "../elementSpec";
import { ProseMirrorFieldView } from "../fieldViews/ProseMirrorFieldView";
import { createTextField } from "../fieldViews/TextFieldView";
import { createEditorWithElements } from "../helpers/test";

describe("createPlugin", () => {
  // Called when our consumer is updated by the plugin.
  const consumerRenderSpy = jest.fn();

  const testElement = createElementSpec(
    { field1: createTextField() },
    (
      _validate,
      _dom,
      _fields,
      _updateFields,
      _fieldValues,
      _commands,
      subscribe
    ) => subscribe(consumerRenderSpy),
    () => undefined
  );

  // Called when our fieldView is updated by the plugin.
  let fieldViewRenderSpy: jest.SpyInstance<unknown>;
  beforeAll(() => {
    fieldViewRenderSpy = jest.spyOn(ProseMirrorFieldView.prototype, "onUpdate");
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    fieldViewRenderSpy.mockReset();
    consumerRenderSpy.mockReset();
  });

  const createEditorWithSingleElementPresent = (plugins: Plugin[] = []) => {
    const helpers = createEditorWithElements(
      {
        testElement,
      },
      `<p>Example doc</p>`,
      plugins
    );
    const exampleText = (helpers.view.state.schema as Schema).text(
      "New content"
    );

    helpers.insertElement({
      elementName: "testElement",
      values: { field1: "Element content" },
    })(helpers.view.state, helpers.view.dispatch);

    return { ...helpers, exampleText };
  };

  describe("Response to content changes", () => {
    it("should not update consumers or fieldViews when the element content has not changed", () => {
      const { view, exampleText } = createEditorWithSingleElementPresent();

      const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
      const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

      const positionAfterElement = 19;
      const tr = view.state.tr.replaceRangeWith(
        positionAfterElement,
        positionAfterElement,
        exampleText
      );
      view.dispatch(tr);

      expect(consumerRenderSpy.mock.calls.length).toBe(
        initialConsumerUpdateCount
      );
      expect(fieldViewRenderSpy.mock.calls.length).toBe(
        initialFieldViewUpdateCount
      );
    });

    it("should update the consumer and FieldView and when the element content has changed", () => {
      const { view, exampleText } = createEditorWithSingleElementPresent();

      const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
      const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

      // This edit falls inside of the element, replacing its content
      const positionInsideElement = 5;
      const tr = view.state.tr.replaceWith(
        positionInsideElement,
        positionInsideElement,
        exampleText
      );
      view.dispatch(tr);

      expect(consumerRenderSpy.mock.calls.length).toBe(
        initialConsumerUpdateCount + 1
      );
      expect(fieldViewRenderSpy.mock.calls.length).toBe(
        initialFieldViewUpdateCount + 1
      );
    });
  });

  describe("Response to decoration changes", () => {
    it("should not update the consumer and FieldView when the decorations have not changed", () => {
      // This plugin returns the same set of decorations on each state transition.
      const decos = new DecorationSet();
      const decoPlugin = new Plugin({
        props: {
          decorations: () => decos,
        },
      });
      const { view } = createEditorWithSingleElementPresent([decoPlugin]);

      const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
      const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

      const tr = view.state.tr.setMeta(
        "NO_OP",
        "A change that does not affect content"
      );
      view.dispatch(tr);

      expect(consumerRenderSpy.mock.calls.length).toBe(
        initialConsumerUpdateCount
      );
      expect(fieldViewRenderSpy.mock.calls.length).toBe(
        initialFieldViewUpdateCount
      );
    });

    it("should update the FieldView when decorations change that touch the content", () => {
      // This plugin returns a new set of decorations on each state transition.
      const positionInsideElement = 5;
      const decoPlugin = new Plugin({
        props: {
          decorations: (state) => {
            return new DecorationSet().add(state.doc, [
              Decoration.inline(
                positionInsideElement,
                positionInsideElement + 1,
                {}
              ),
            ]);
          },
        },
      });
      const { view } = createEditorWithSingleElementPresent([decoPlugin]);

      const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
      const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

      const tr = view.state.tr.setMeta(
        "NO_OP",
        "A change that does not affect content"
      );
      view.dispatch(tr);

      expect(consumerRenderSpy.mock.calls.length).toBe(
        initialConsumerUpdateCount
      );
      expect(fieldViewRenderSpy.mock.calls.length).toBe(
        initialFieldViewUpdateCount + 1
      );
    });

    it("should not update the consumer and FieldView when a decoration change does not touch element content", () => {
      // This plugin returns a new set of decorations on each state transition.
      const positionOutsideElement = 18;
      const decoPlugin = new Plugin({
        props: {
          decorations: (state) => {
            return new DecorationSet().add(state.doc, [
              Decoration.inline(
                positionOutsideElement,
                positionOutsideElement + 1,
                {}
              ),
            ]);
          },
        },
      });

      const { view } = createEditorWithSingleElementPresent([decoPlugin]);

      const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
      const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

      const tr = view.state.tr.setMeta(
        "NO_OP",
        "A change that does not affect content"
      );
      view.dispatch(tr);

      expect(consumerRenderSpy.mock.calls.length).toBe(
        initialConsumerUpdateCount
      );
      expect(fieldViewRenderSpy.mock.calls.length).toBe(
        initialFieldViewUpdateCount
      );
    });
  });
});
