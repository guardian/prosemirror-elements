import {
  addNestedElement,
  addRepeaterElement,
  getElementRichTextField,
  visitRoot,
} from "../helpers/editor";

describe("Decorations", () => {
  beforeEach(visitRoot);
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

    getElementRichTextField("repeaterText")
      .find(".TestDecoration")
      .should("have.length", 2);
    getElementRichTextField("nestedRepeaterText")
      .find(".TestDecoration")
      .should("have.length", 1);
  });

  it(`should render decorations in repeater fields within nested element fields`, () => {
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
    getElementRichTextField("content")
      .find(".TestDecoration")
      .each((el) => {
        cy.wrap(el).should("have.text", "deco");
      });
  });
});
