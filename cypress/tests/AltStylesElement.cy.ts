import { sampleAltStylesElement } from "../../demo/sampleElements";
import {
  addChildTestId,
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

  it("should remove repeater children", () => {
    addAltStyleElement(sampleAltStylesElement);
    const addRepeaterButtons = getButton(addChildTestId);
    addRepeaterButtons.click();
    cy.get(`div${selectDataCy("AltStyleElement")}`)
      .children()
      .should("have.length", 2);
    getButton(removeChildTestId).first().click();
    getButton(removeChildTestId).first().click();
    cy.get(`div${selectDataCy("AltStyleElement")}`)
      .children()
      .should("have.length", 1);
    getButton(removeChildTestId).should("be.disabled"); // because you can't delete the last one
    // force click to bypass the disabled check
    getButton(removeChildTestId).first().click({ force: true });
    getButton(removeChildTestId).first().click({ force: true });
    // still one left
    cy.get(`div${selectDataCy("AltStyleElement")}`)
      .children()
      .should("have.length", 1);
  });
});
