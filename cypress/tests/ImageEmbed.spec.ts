import {
  addEmbed,
  assertDocHtml,
  getEmbedField,
  getEmbedMenuButton,
  getEmbedRichTextField,
  typeIntoEmbedField,
  typeIntoProsemirror,
} from "../helpers/editor";

describe("ImageEmbed", () => {
  beforeEach(() => cy.visit("/"));

  const rteFields = ["caption", "altText"];
  const rteFieldStyles = [
    { title: "strong style", tag: "strong" },
    { title: "emphasis", tag: "em" },
  ];

  describe("Accepting input", () => {
    it("should accept editor input", () => {
      typeIntoProsemirror("{selectall}Text");
      cy.get(".ProseMirror > p").should("have.text", "Text");
    });

    describe("Rich text field", () => {
      rteFields.forEach((field) => {
        it(`${field} – should accept input in an embed`, () => {
          addEmbed();
          const text = `${field} text`;
          typeIntoEmbedField(field, text);
          getEmbedRichTextField(field).should("have.text", text);
        });

        it(`${field} – should render decorations passed from the parent editor`, () => {
          addEmbed();
          const text = `${field} deco `;
          typeIntoEmbedField(field, text);
          getEmbedRichTextField(field)
            .find(".TestDecoration")
            .should("have.text", "deco");
        });

        it(`${field} – should map decorations passed from the parent editor correctly when they move`, () => {
          addEmbed();
          const text = `${field} deco{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow} more text`;
          typeIntoEmbedField(field, text);
          getEmbedRichTextField(field)
            .find(".TestDecoration")
            .should("have.text", "deco");
        });

        rteFieldStyles.forEach((style) => {
          it(`${field} – should toggle style of an input in an embed`, () => {
            addEmbed();
            getEmbedMenuButton(field, `Toggle ${style.title}`).click();
            typeIntoEmbedField(field, "Example text");
            getEmbedRichTextField(field)
              .find(style.tag)
              .should("have.text", "Example text");
          });
        });

        it("should serialise content as HTML within the appropriate nodes in the document", () => {
          addEmbed();
          typeIntoEmbedField("caption", "Caption text");
          typeIntoEmbedField("altText", "Alt text");
          assertDocHtml(
            `<imageembed type="imageEmbed" has-errors="false"><div class="ProsemirrorEmbed__imageEmbed-caption"><p>Caption text</p></div><div class="ProsemirrorEmbed__imageEmbed-altText"><p>Alt text</p></div><embed-imageembed-usesrc class="ProsemirrorEmbed__imageEmbed-useSrc" fields="{}"></embed-imageembed-usesrc></imageembed><p>First paragraph</p><p>Second paragraph</p>`
          );
        });
      });
    });

    describe("Checkbox field", () => {
      it(`should be clickable`, () => {
        addEmbed();
        getEmbedField("useSrc").find("input").click();
        getEmbedField("useSrc").find("input").should("be.checked");
      });

      it(`should serialise state as field attributes on the appropriate node in the document - checked`, () => {
        addEmbed();
        getEmbedField("useSrc").find("input").click();
        assertDocHtml(
          `<imageembed type="imageEmbed" has-errors="false"><div class="ProsemirrorEmbed__imageEmbed-caption"><p></p></div><div class="ProsemirrorEmbed__imageEmbed-altText"><p></p></div><embed-imageembed-usesrc class="ProsemirrorEmbed__imageEmbed-useSrc" fields="{&quot;value&quot;:true}"></embed-imageembed-usesrc></imageembed><p>First paragraph</p><p>Second paragraph</p>`
        );
      });

      it(`should serialise state as field attributes on the appropriate node in the document - unchecked`, () => {
        addEmbed();
        getEmbedField("useSrc").find("input").click();
        getEmbedField("useSrc").find("input").click();
        assertDocHtml(
          `<imageembed type="imageEmbed" has-errors="false"><div class="ProsemirrorEmbed__imageEmbed-caption"><p></p></div><div class="ProsemirrorEmbed__imageEmbed-altText"><p></p></div><embed-imageembed-usesrc class="ProsemirrorEmbed__imageEmbed-useSrc" fields="{&quot;value&quot;:false}"></embed-imageembed-usesrc></imageembed><p>First paragraph</p><p>Second paragraph</p>`
        );
      });
    });
  });
});
