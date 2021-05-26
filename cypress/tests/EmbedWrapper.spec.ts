import { ImageEmbedTestId } from "../../src/embeds/image/ImageEmbed";
import {
  moveBottomTestId,
  moveDownTestId,
  moveTopTestId,
  moveUpTestId,
  removeTestId,
} from "../../src/renderers/react/EmbedWrapper";
import {
  addEmbed,
  getArrayOfBlockElementTypes,
  selectDataCy,
} from "../helpers/editor";

describe("EmbedWrapper", () => {
  beforeEach(() => cy.visit("/"));

  describe("Embed creation", () => {
    it("should create an element given its DOM specification", () => {
      addEmbed();
      cy.get(selectDataCy(ImageEmbedTestId));
    });
  });

  describe("Embed movement", () => {
    it("should move an element down", async () => {
      addEmbed();
      cy.get(selectDataCy(moveDownTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "embed", "paragraph"]);
    });

    it("should move an element to the bottom", async () => {
      addEmbed();
      cy.get(selectDataCy(moveBottomTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "paragraph", "embed"]);
    });

    it("should move an element up", async () => {
      addEmbed();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveUpTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "embed", "paragraph"]);
    });

    it("should move an element to the top", async () => {
      addEmbed();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveDownTestId)).click();
      cy.get(selectDataCy(moveTopTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["embed", "paragraph", "paragraph"]);
    });

    it("should remove an element", async () => {
      addEmbed();
      cy.get(selectDataCy(removeTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "paragraph"]);
    });
  });
});
