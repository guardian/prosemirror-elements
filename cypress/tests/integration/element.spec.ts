import { ImageEmbedTestId } from "../../../src/embeds/image/ImageEmbed";
import {
  moveBottomTestId,
  moveDownTestId,
  moveTopTestId,
  moveUpTestId,
  removeTestId,
} from "../../../src/mounters/react/EmbedWrapper";
import {
  addEmbed,
  assertDocHtml,
  getArrayOfBlockElementTypes,
  getEmbedField,
  selectDataCy,
  typeIntoEmbedField,
  typeIntoProsemirror,
} from "../../helpers/editor";

describe("Element interations", () => {
  beforeEach(() => cy.visit("/"));

  describe("Element creation", () => {
    it("should create an element given its DOM specification", () => {
      addEmbed();
      cy.get(selectDataCy(ImageEmbedTestId));
    });
  });

  describe("Element movement", () => {
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

  describe("Element input", () => {
    it("should accept input", () => {
      typeIntoProsemirror("{selectall}Text", 1);
      cy.get(".ProseMirror > p").should("have.text", "Text");
    });

    it("should accept input in an embed", () => {
      addEmbed();
      typeIntoEmbedField("caption", "Caption text");
      getEmbedField("caption").should("have.text", "Caption text");
    });
  });

  describe("Element input content modelling", () => {
    it("should model an embed field as a node in the document", () => {
      addEmbed();
      typeIntoEmbedField("caption", "Caption text");
      assertDocHtml(
        `<embed-attrs type="imageEmbed" fields="{&quot;alt&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;src&quot;:&quot;&quot;}" has-errors="false"><div class="imageNative-caption"><p>Caption text</p></div><div class="imageNative-altText"><p></p></div></embed-attrs><p>First paragraph</p><p>Second paragraph</p>`
      );
    });
  });
});
