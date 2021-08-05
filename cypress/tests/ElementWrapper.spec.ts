import { ImageElementTestId } from "../../src/elements/demo-image/DemoImageElementForm";
import {
  moveBottomTestId,
  moveDownTestId,
  moveTopTestId,
  moveUpTestId,
  removeTestId,
} from "../../src/renderers/react/ElementWrapper";
import {
  addImageElement,
  getArrayOfBlockElementTypes,
  selectDataCy,
  visitRoot,
} from "../helpers/editor";

describe("ElementWrapper", () => {
  beforeEach(visitRoot);

  describe("Element creation", () => {
    it("should create an element given its DOM specification", () => {
      addImageElement();
      cy.get(selectDataCy(ImageElementTestId));
    });
  });

  describe("Element movement", () => {
    it("should move an element down", async () => {
      addImageElement();
      cy.get(selectDataCy(moveDownTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "element", "paragraph"]);
    });

    it("should move an element to the bottom", async () => {
      addImageElement();
      cy.get(selectDataCy(moveBottomTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "paragraph", "element"]);
    });

    it("should move an element up", async () => {
      addImageElement();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveUpTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "element", "paragraph"]);
    });

    it("should move an element to the top", async () => {
      addImageElement();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveTopTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["element", "paragraph", "paragraph"]);
    });

    it("should remove an element", async () => {
      addImageElement();
      cy.get(selectDataCy(removeTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "paragraph"]);
    });
  });
});
