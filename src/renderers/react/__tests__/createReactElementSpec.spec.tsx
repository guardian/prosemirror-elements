import { getByLabelText, getByText, waitFor } from "@testing-library/dom";
import { FieldWrapper } from "../../../editorial-source-components/FieldWrapper";
import { createTextField } from "../../../plugin/fieldViews/TextFieldView";
import { createEditorWithElements } from "../../../plugin/helpers/test";
import { createReactElementSpec } from "../createReactElementSpec";

describe("createReactElementSpec", () => {
  const onDestroy = jest.fn();
  const testElement = createReactElementSpec({
    fieldDescriptions: {
      field1: createTextField(),
    },
    consumer: ({ fields }) => (
      <div>
        <FieldWrapper
          headingLabel="field1"
          field={fields.field1}
        ></FieldWrapper>
      </div>
    ),
    validate: undefined,
    onRemove: onDestroy,
  });

  afterEach(() => jest.resetAllMocks());

  it("should render an element and mount its fields", async () => {
    const { view, insertElement } = createEditorWithElements({ testElement });
    insertElement({
      elementName: "testElement",
      values: { field1: "Example text" },
    })(view.state, view.dispatch);

    const dom = view.dom;

    await waitFor(() => {
      expect(getByLabelText(dom, "field1")).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText(dom, "Example text")).toBeTruthy();
    });
  });

  it("should call the callback passed to onDestroy with the field values when an element is removed", async () => {
    const { view, insertElement } = createEditorWithElements({ testElement });
    insertElement({
      elementName: "testElement",
      values: { field1: "Example text" },
    })(view.state, view.dispatch);

    const dom = view.dom;

    await waitFor(() => getByLabelText(dom, "field1"));

    const removeButton = getByLabelText(dom, "Delete element");
    removeButton.click();
    removeButton.click();

    await waitFor(() => {
      expect(onDestroy.mock.calls[0]).toEqual([{ field1: "Example text" }]);
    });
  });
});
