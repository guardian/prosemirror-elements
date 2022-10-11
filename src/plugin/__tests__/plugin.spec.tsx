import type { Schema } from "prosemirror-model";
import { AllSelection, Plugin, TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { Decoration, DecorationSet } from "prosemirror-view";
import { createElementSpec } from "../elementSpec";
import { ProseMirrorFieldView } from "../fieldViews/ProseMirrorFieldView";
import { createDefaultRichTextField } from "../fieldViews/RichTextFieldView";
import { createTextField } from "../fieldViews/TextFieldView";
import type { FieldNameToValueMapWithEmptyValues } from "../helpers/fieldView";
import { createEditorWithElements } from "../helpers/test";
import { elementSelectedNodeAttr } from "../nodeSpec";
import type { FieldDescriptions } from "../types/Element";

describe("createPlugin", () => {
  // Called when our consumer is updated by the plugin.
  const consumerRenderSpy = jest.fn();

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

  type CreateEditorOptions<FDesc extends FieldDescriptions<string>> = {
    plugins: Plugin[];
    element: FDesc;
    initialData: FieldNameToValueMapWithEmptyValues<FDesc>;
  };

  const defaultEditorOptions = {
    plugins: [],
    element: {
      textField: createTextField(),
    },
    initialData: {
      textField: "Example content",
    },
  };

  const createEditorWithSingleElementPresent = <
    FDesc extends FieldDescriptions<string>
  >({
    plugins,
    element,
    initialData,
  }: CreateEditorOptions<FDesc>) => {
    const testElement = createElementSpec(
      element,
      (_validate, _dom, fields, _updateFields, commands, subscribe) => {
        // We call our spy once for the initial render, and then subscribe for update.
        consumerRenderSpy(fields, commands, false);
        subscribe(consumerRenderSpy);
      },
      () => undefined,
      () => undefined
    );

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
      values: initialData,
    })(helpers.view.state, helpers.view.dispatch);

    return { ...helpers, exampleText };
  };

  const createDefaultEditor = () =>
    createEditorWithSingleElementPresent(defaultEditorOptions);

  describe("Response to content changes", () => {
    it("should not update consumers or fieldViews when the element content has not changed", () => {
      const { view, exampleText } = createDefaultEditor();

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

    it("should call the consumer and FieldView when the element content has changed", () => {
      const { view, exampleText } = createDefaultEditor();

      const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
      const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

      // This edit falls inside of the element, inserting new content
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

    it("should provide the consumer with new field values when element content has changed", () => {
      const { view, exampleText } = createDefaultEditor();

      // This edit covers the whole of the element field, replacing its content
      const positionInsideElement = 2;
      const tr = view.state.tr.replaceWith(
        positionInsideElement,
        positionInsideElement + 15,
        exampleText
      );
      view.dispatch(tr);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access -- waive type for mock
      const newFieldValues = consumerRenderSpy.mock.calls.pop()[0];
      expect(newFieldValues).toMatchObject({
        textField: { value: "New content" },
      });
    });

    it("should only escape rich text content", () => {
      createEditorWithSingleElementPresent({
        plugins: [],
        element: {
          textField: createTextField(),
          richTextField: createDefaultRichTextField(),
        },
        initialData: {
          textField: "<>",
          richTextField: "<>",
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access -- waive type for mock
      const newFieldValues = consumerRenderSpy.mock.calls.pop()[0];
      expect(newFieldValues).toMatchObject({
        textField: { value: "<>" },
        richTextField: { value: "<p>&lt;&gt;</p>" },
      });
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
      const { view } = createEditorWithSingleElementPresent({
        ...defaultEditorOptions,
        plugins: [decoPlugin],
      });

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
      const { view } = createEditorWithSingleElementPresent({
        ...defaultEditorOptions,
        plugins: [decoPlugin],
      });

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

      const { view } = createEditorWithSingleElementPresent({
        ...defaultEditorOptions,
        plugins: [decoPlugin],
      });

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

  describe("Response to command changes", () => {
    it("should update the consumer when the command output changes", () => {
      const { view } = createDefaultEditor();

      const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
      const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

      // By inserting content before the element, we enable the content to move
      // upward, changing the command output.
      const positionThatEnablesUpCommand = 0;
      const tr = view.state.tr.replaceWith(
        positionThatEnablesUpCommand,
        positionThatEnablesUpCommand,
        (view.state.schema as Schema).text("Text before element")
      );
      view.dispatch(tr);

      expect(consumerRenderSpy.mock.calls.length).toBe(
        initialConsumerUpdateCount + 1
      );
      expect(fieldViewRenderSpy.mock.calls.length).toBe(
        initialFieldViewUpdateCount
      );
    });
  });

  describe("Response to selection changes", () => {
    const applyNoopSelection = (view: EditorView) => {
      const selectEntireDoc = TextSelection.between(
        view.state.doc.resolve(0),
        view.state.doc.resolve(1)
      );
      const tr = view.state.tr.setSelection(selectEntireDoc);
      view.dispatch(tr);
    };
    const applyWholeDocSelection = (view: EditorView) => {
      const selectEntireDoc = new AllSelection(view.state.doc);
      const tr = view.state.tr.setSelection(selectEntireDoc);
      view.dispatch(tr);
    };

    describe("when selection does not affect element", () => {
      it("should not update the consumer", () => {
        const { view } = createDefaultEditor();

        const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
        applyNoopSelection(view);

        expect(consumerRenderSpy.mock.calls.length).toBe(
          initialConsumerUpdateCount
        );
      });

      it("should not update the fieldView", () => {
        const { view } = createDefaultEditor();

        const initialFieldViewUpdateCount =
          fieldViewRenderSpy.mock.calls.length;

        applyNoopSelection(view);

        expect(fieldViewRenderSpy.mock.calls.length).toBe(
          initialFieldViewUpdateCount
        );
      });

      it("should not update the element node", () => {
        const { view } = createDefaultEditor();

        applyNoopSelection(view);

        expect(view.state.doc.firstChild?.attrs).toMatchObject({
          [elementSelectedNodeAttr]: false,
        });
      });
    });

    describe("when selection includes element", () => {
      it("should update the consumer", () => {
        const { view } = createDefaultEditor();

        const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
        applyWholeDocSelection(view);

        expect(consumerRenderSpy.mock.calls.length).toBe(
          initialConsumerUpdateCount + 1
        );
      });

      it("should not update the fieldView", () => {
        const { view } = createDefaultEditor();

        const initialFieldViewUpdateCount =
          fieldViewRenderSpy.mock.calls.length;

        applyWholeDocSelection(view);

        expect(fieldViewRenderSpy.mock.calls.length).toBe(
          initialFieldViewUpdateCount
        );
      });

      it("should update the element node", () => {
        const { view } = createDefaultEditor();

        applyWholeDocSelection(view);

        expect(view.state.doc.firstChild?.attrs).toMatchObject({
          [elementSelectedNodeAttr]: true,
        });
      });
    });

    describe("when selection no longer includes element", () => {
      it("should update the consumer", () => {
        const { view } = createDefaultEditor();

        applyWholeDocSelection(view);

        const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;

        applyNoopSelection(view);

        expect(consumerRenderSpy.mock.calls.length).toBe(
          initialConsumerUpdateCount + 1
        );
      });

      it("should not update the fieldView", () => {
        const { view } = createDefaultEditor();

        applyWholeDocSelection(view);

        const initialFieldViewUpdateCount =
          fieldViewRenderSpy.mock.calls.length;

        applyNoopSelection(view);

        expect(fieldViewRenderSpy.mock.calls.length).toBe(
          initialFieldViewUpdateCount
        );
      });

      it("should update the element node", () => {
        const { view } = createDefaultEditor();

        applyWholeDocSelection(view);
        applyNoopSelection(view);

        expect(view.state.doc.firstChild?.attrs).toMatchObject({
          [elementSelectedNodeAttr]: false,
        });
      });
    });
  });
});
