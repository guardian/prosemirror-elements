import type { Node } from "prosemirror-model";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createEditorWithElements } from "../../plugin/helpers/test";
import { createGuElementSpec } from "../createGuElementSpec";

const guElement = createGuElementSpec(
  { exampleField: createTextField() },
  () => <p></p>,
  () => null,
  true
);

describe("createGuElementSpec", () => {
  it("should transform data with the provided transformer", () => {
    const {
      getElementDataFromNode,
      serializer,
      view,
      insertElement,
    } = createEditorWithElements({
      guElement,
    });

    const elementData = {
      assets: [],
      fields: { exampleField: "", isMandatory: true },
    };

    // This is effectively a roundtrip – insert element transforms on the way in ...
    insertElement({
      elementName: "guElement",
      values: elementData,
    })(view.state, view.dispatch);

    // ... and getElementDataFromNode transforms on the way out.
    const elementDataFromNode = getElementDataFromNode(
      view.state.doc.content.firstChild as Node,
      serializer
    );

    expect(elementDataFromNode).toEqual({
      elementName: "guElement",
      values: elementData,
    });
  });
});
