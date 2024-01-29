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
        content: "",
      },
      {
        title: "B",
        content: "",
      },
      {
        title: "C",
        content: "",
      },
    ],
  };

  it("should move repeater child up", () => {
    addAltStyleElement(repeaterWithChildren);
    const moveChildUpButtons = getButton(moveChildUpTestId);

    // try to move A up - should be disabled
    moveChildUpButtons.first().should("be.disabled");
    moveChildUpButtons.first().click({ force: true }); // force click to bypass the disabled check
    cy.get(altStyleSelector).children().eq(0).should("contain", "A");
    cy.get(altStyleSelector).children().eq(1).should("contain", "B");
    cy.get(altStyleSelector).children().eq(2).should("contain", "C");

    // try to move B up
    getButton(moveChildUpTestId).children().eq(1).click();
    cy.get(altStyleSelector).children().eq(0).should("contain", "B");
    cy.get(altStyleSelector).children().eq(1).should("contain", "A");
    cy.get(altStyleSelector).children().eq(2).should("contain", "C");

    // try to move C up
    getButton(moveChildUpTestId).children().eq(2).click();
    cy.get(altStyleSelector).children().eq(0).should("contain", "B");
    cy.get(altStyleSelector).children().eq(1).should("contain", "C");
    cy.get(altStyleSelector).children().eq(2).should("contain", "A");
  });

  it("should move repeater child down", () => {
    addAltStyleElement(repeaterWithChildren);
    const moveChildDownButtons = getButton(moveChildDownTestId);

    // try to move C down - should be disabled
    moveChildDownButtons.last().should("be.disabled");
    moveChildDownButtons.last().click({ force: true }); // force click to bypass the disabled check
    cy.get(altStyleSelector).children().eq(0).should("contain", "A");
    cy.get(altStyleSelector).children().eq(1).should("contain", "B");
    cy.get(altStyleSelector).children().eq(2).should("contain", "C");

    // try to move B down
    getButton(moveChildDownTestId).children().eq(1).click();
    cy.get(altStyleSelector).children().eq(0).should("contain", "A");
    cy.get(altStyleSelector).children().eq(1).should("contain", "C");
    cy.get(altStyleSelector).children().eq(2).should("contain", "B");

    // try to move A down
    getButton(moveChildDownTestId).children().eq(0).click();
    cy.get(altStyleSelector).children().eq(0).should("contain", "C");
    cy.get(altStyleSelector).children().eq(1).should("contain", "A");
    cy.get(altStyleSelector).children().eq(2).should("contain", "B");
  });
});
