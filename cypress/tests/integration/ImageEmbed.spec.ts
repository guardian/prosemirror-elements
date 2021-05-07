import {
  addEmbed,
  assertDocHtml,
  getEmbedField,
  typeIntoEmbedField,
  typeIntoProsemirror,
} from "../../helpers/editor";

describe("ImageEmbed", () => {
  beforeEach(() => cy.visit("/"));

  describe("Accepting input", () => {
    it("should accept editor input", () => {
      typeIntoProsemirror("{selectall}Text");
      cy.get(".ProseMirror > p").should("have.text", "Text");
    });

    it("should accept input in an embed - caption", () => {
      addEmbed();
      typeIntoEmbedField("caption", "Caption text");
      getEmbedField("caption").should("have.text", "Caption text");
    });

    it("should accept input in an embed - altText", () => {
      addEmbed();
      typeIntoEmbedField("altText", "Alt text");
      getEmbedField("altText").should("have.text", "Alt text");
    });
  });

  describe("Element input content modelling", () => {
    it("should model RTE fields as nodes in the document", () => {
      addEmbed();
      typeIntoEmbedField("caption", "Caption text");
      typeIntoEmbedField("altText", "Alt text");
      assertDocHtml(
        `<embed-attrs type="imageEmbed" fields="{&quot;alt&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;src&quot;:&quot;&quot;}" has-errors="false"><div class="imageNative-caption"><p>Caption text</p></div><div class="imageNative-altText"><p>Alt text</p></div></embed-attrs><p>First paragraph</p><p>Second paragraph</p>`
      );
    });
  });
});
