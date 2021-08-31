import type { Node } from "prosemirror-model";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createEditorWithElements } from "../../plugin/helpers/test";
import { createGuElementSpec } from "../createGuElementSpec";

describe("createGuElementSpec", () => {
  it("should transform data with the provided transformer", () => {
    const guElement = createGuElementSpec(
      { exampleField: createTextField() },
      () => <p></p>,
      () => undefined,
      true
    );

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

  it("should not add an isMandatory property if not specified", () => {
    const guElement = createGuElementSpec(
      { exampleField: createTextField() },
      () => <p></p>,
      () => undefined
    );

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
      fields: { exampleField: "" },
    };

    insertElement({
      elementName: "guElement",
      values: elementData,
    })(view.state, view.dispatch);

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
