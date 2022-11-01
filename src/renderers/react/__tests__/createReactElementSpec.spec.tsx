import { getByLabelText, getByText, waitFor } from "@testing-library/dom";
import { FieldWrapper } from "../../../editorial-source-components/FieldWrapper";
import { createTextField } from "../../../plugin/fieldViews/TextFieldView";
import { createEditorWithElements } from "../../../plugin/helpers/test";
import { createReactElementSpec } from "../createReactElementSpec";

describe("createReactElementSpec", () => {
  const testElement = createReactElementSpec(
    {
      field1: createTextField(),
    },
    ({ fields }) => (
      <div>
        <FieldWrapper
          headingLabel="field1"
          field={fields.field1}
        ></FieldWrapper>
      </div>
    ),
    undefined
  );

  it("should render an element and mount its fields", async () => {
    const { view, insertElement } = createEditorWithElements({ testElement });
    insertElement({
      elementName: "testElement",
      values: { field1: "Example text" },
    })(view.state, view.dispatch);

    const dom = view.dom as HTMLElement;

    await waitFor(() => {
      expect(getByLabelText(dom, "field1")).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText(dom, "Example text")).toBeTruthy();
    });
  });
});
