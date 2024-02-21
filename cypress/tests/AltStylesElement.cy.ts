import { sampleAltStylesElement } from "../../demo/sampleElements";
import {
  addChildTestId,
  moveChildDownTestId,
  moveChildUpTestId,
  removeChildTestId,
} from "../../src/renderers/react/WrapperControls";
import {
  addAltStyleElement,
  getButton,
  getElementRichTextField,
  selectDataCy,
  visitRoot,
} from "../helpers/editor";

describe("AltStyleElement", () => {
  beforeEach(visitRoot);

  const altStyleSelector = `div${selectDataCy("AltStyleElement")}`;

  it("should add repeater children", () => {
    addAltStyleElement(sampleAltStylesElement);
    cy.get(altStyleSelector).children().should("have.length", 1);
    const addRepeaterButtons = getButton(addChildTestId);
    addRepeaterButtons.click();
    cy.get(altStyleSelector).children().should("have.length", 2);
  });

  it("should remove repeater children", () => {
    addAltStyleElement(sampleAltStylesElement);
    const addRepeaterButtons = getButton(addChildTestId);
    addRepeaterButtons.click();
    cy.get(altStyleSelector).children().should("have.length", 2);
    getButton(removeChildTestId).first().click();
    getButton(removeChildTestId).first().click(); // second click needed to confirm delete
    cy.get(altStyleSelector).children().should("have.length", 1);
    getButton(removeChildTestId).should("be.disabled"); // because you can't delete the last one
    getButton(removeChildTestId).first().click({ force: true }); // force click to bypass the disabled check
    getButton(removeChildTestId).first().click({ force: true }); // second click needed to confirm delete
    cy.get(altStyleSelector).children().should("have.length", 1); // still one left
  });

  const repeaterWithChildren = {
    repeater: [
      {
        title: "A",
        content: [],
      },
      {
        title: "B",
        content: [],
      },
      {
        title: "C",
        content: [],
      },
    ],
  };

  const assertOrderOfTitleFields = (titles: string[]) =>
    titles.map((title, index) =>
      getElementRichTextField("title").eq(index).should("have.text", title)
    );

  it("should move repeater child up", () => {
    addAltStyleElement(repeaterWithChildren);
    const moveChildUpButtons = getButton(moveChildUpTestId);

    // try to move A up - should be disabled
    moveChildUpButtons.first().should("be.disabled");
    moveChildUpButtons.first().click({ force: true }); // force click to bypass the disabled check
    assertOrderOfTitleFields(["A", "B", "C"]);

    // try to move B up
    getButton(moveChildUpTestId).children().eq(1).click();
    assertOrderOfTitleFields(["B", "A", "C"]);

    // try to move C up
    getButton(moveChildUpTestId).children().eq(2).click();
    assertOrderOfTitleFields(["B", "C", "A"]);
  });

  it("should move repeater child down", () => {
    addAltStyleElement(repeaterWithChildren);
    const moveChildDownButtons = getButton(moveChildDownTestId);

    // try to move C down - should be disabled
    moveChildDownButtons.last().should("be.disabled");
    moveChildDownButtons.last().click({ force: true }); // force click to bypass the disabled check
    assertOrderOfTitleFields(["A", "B", "C"]);

    // try to move B down
    getButton(moveChildDownTestId).children().eq(1).click();
    assertOrderOfTitleFields(["A", "C", "B"]);

    // try to move A down
    getButton(moveChildDownTestId).children().eq(0).click();
    assertOrderOfTitleFields(["C", "A", "B"]);
  });

  it(`multiple NestedElements IN repeater – should render decorations passed from the parent editor`, () => {
    addAltStyleElement(repeaterWithChildren);
    getElementRichTextField("content").first().focus().type(" deco ");
    getElementRichTextField("content").last().focus().type(" deco ");
    getElementRichTextField("content")
      .first()
      .find(".TestDecoration")
      .should("have.text", "deco");
    getElementRichTextField("content")
      .last()
      .find(".TestDecoration")
      .should("have.text", "deco");
  });
});
