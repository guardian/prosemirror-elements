import {
  addNestedElement,
  addRepeaterElement,
  getElementRichTextField,
  visitRoot,
} from "../helpers/editor";

describe("Decorations", () => {
  beforeEach(visitRoot);

  const assertDecosAreValidForField = (
    fieldName: string,
    decoCount: number
  ) => {
    getElementRichTextField(fieldName)
      .find(".TestDecoration")
      .then((items) => {
        expect(items.length).to.equal(decoCount);
        items.each((_, item) => {
          expect(item).to.contain.text("deco");
        });
      });
  };

  it("should render decorations in repeater fields", () => {
    addRepeaterElement({
      repeater: [
        {
          repeaterText: "Example repeater text 1 deco",
          nestedRepeater: [
            { nestedRepeaterText: "Example nested repeater text 1 deco" },
          ],
        },
        { repeaterText: "Example repeater text 2 deco" },
      ],
    });

    assertDecosAreValidForField("repeaterText", 2);
    assertDecosAreValidForField("nestedRepeaterText", 1);
  });

  it.only(`should render decorations in repeater fields within nested element fields`, () => {
    addNestedElement({
      repeater: [
        {
          title: "A",
          content: [
            {
              assets: [],
              elementType: "pullquote",
              fields: { html: "Example pullquote with deco" },
            },
          ],
        },
        {
          title: "C",
          content: [
            {
              assets: [],
              elementType: "pullquote",
              fields: { html: "Example pullquote with deco" },
            },
          ],
        },
      ],
    });

    assertDecosAreValidForField("content", 2);
  });
});
