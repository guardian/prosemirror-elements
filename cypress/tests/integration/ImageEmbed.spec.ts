import {
  addEmbed,
  assertDocHtml,
  getEmbedField,
  getEmbedMenuButton,
  typeIntoEmbedField,
  typeIntoProsemirror,
} from "../../helpers/editor";

describe("ImageEmbed", () => {
  beforeEach(() => cy.visit("/"));

  const fields = ["caption", "altText"];
  const fieldStyles = [
    { title: "strong style", tag: "strong" },
    { title: "emphasis", tag: "em" },
  ];

  describe("Accepting input", () => {
    it("should accept editor input", () => {
      typeIntoProsemirror("{selectall}Text");
      cy.get(".ProseMirror > p").should("have.text", "Text");
    });

    fields.forEach((field) => {
      it(`should accept input in an embed for the ${field} field`, () => {
        addEmbed();
        const text = `${field} text`;
        typeIntoEmbedField(field, text);
        getEmbedField(field).should("have.text", text);
      });

      fieldStyles.forEach((style) => {
        it("should toggle style of an input in an embed - altText", () => {
          addEmbed();
          getEmbedMenuButton(field, `Toggle ${style.title}`).click();
          typeIntoEmbedField(field, "Example text");
          getEmbedField(field).find(style.tag);
        });
      });
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
