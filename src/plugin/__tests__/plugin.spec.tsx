import type { Schema } from "prosemirror-model";
import { createElementSpec } from "../elementSpec";
import { ProseMirrorFieldView } from "../fieldViews/ProseMirrorFieldView";
import { createTextField } from "../fieldViews/TextFieldView";
import { createEditorWithElements } from "../helpers/test";

describe("createPlugin", () => {
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

  it("should not rerender consumers or fieldViews when the element content has not changed", () => {
    const { insertElement, view } = createEditorWithElements(
      {
        testElement,
      },
      `<p>Example doc</p>`
    );
    const exampleText = (view.state.schema as Schema).text("New content");

    insertElement({ elementName: "testElement", values: {} })(
      view.state,
      view.dispatch
    );
    const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
    const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

    const tr = view.state.tr.replaceRangeWith(16, 16, exampleText);
    view.dispatch(tr);

    expect(consumerRenderSpy.mock.calls.length).toBe(
      initialConsumerUpdateCount
    );
    expect(fieldViewRenderSpy.mock.calls.length).toBe(
      initialFieldViewUpdateCount
    );
  });

  it("should rerender the consumer and FieldView and when the element content has changed", () => {
    const { insertElement, view } = createEditorWithElements(
      {
        testElement,
      },
      "<p>Example doc</p>"
    );
    const exampleText = (view.state.schema as Schema).text("New content");

    insertElement({
      elementName: "testElement",
      values: { field1: "Field content" },
    })(view.state, view.dispatch);
    const initialConsumerUpdateCount = consumerRenderSpy.mock.calls.length;
    const initialFieldViewUpdateCount = fieldViewRenderSpy.mock.calls.length;

    // This edit falls inside of the element, replacing its content
    const tr = view.state.tr.replaceWith(2, 15, exampleText);
    view.dispatch(tr);

    expect(consumerRenderSpy.mock.calls.length).toBe(
      initialConsumerUpdateCount + 1
    );
    expect(fieldViewRenderSpy.mock.calls.length).toBe(
      initialFieldViewUpdateCount + 1
    );
  });
});
