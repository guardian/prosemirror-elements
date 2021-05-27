import {
  addElement,
  assertDocHtml,
  getElementField,
  getElementMenuButton,
  getElementRichTextField,
  typeIntoElementField,
  typeIntoProsemirror,
} from "../helpers/editor";

describe("ImageElement", () => {
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
        it(`${field} – should accept input in an element`, () => {
          addElement();
          const text = `${field} text`;
          typeIntoElementField(field, text);
          getElementRichTextField(field).should("have.text", text);
        });

        it(`${field} – should render decorations passed from the parent editor`, () => {
          addElement();
          const text = `${field} deco `;
          typeIntoElementField(field, text);
          getElementRichTextField(field)
            .find(".TestDecoration")
            .should("have.text", "deco");
        });

        it(`${field} – should map decorations passed from the parent editor correctly when they move`, () => {
          addElement();
          const text = `${field} deco{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow} more text`;
          typeIntoElementField(field, text);
          getElementRichTextField(field)
            .find(".TestDecoration")
            .should("have.text", "deco");
        });

        rteFieldStyles.forEach((style) => {
          it(`${field} – should toggle style of an input in an element`, () => {
            addElement();
            getElementMenuButton(field, `Toggle ${style.title}`).click();
            typeIntoElementField(field, "Example text");
            getElementRichTextField(field)
              .find(style.tag)
              .should("have.text", "Example text");
          });
        });

        it("should serialise content as HTML within the appropriate nodes in the document", () => {
          addElement();
          typeIntoElementField("caption", "Caption text");
          typeIntoElementField("altText", "Alt text");
          assertDocHtml(
            `<imageelement type="imageElement" has-errors="false"><div class="ProsemirrorElement__imageElement-altText"><p>Alt text</p></div><div class="ProsemirrorElement__imageElement-caption"><p>Caption text</p></div><element-imageelement-usesrc class="ProsemirrorElement__imageElement-useSrc" fields="{&quot;value&quot;:false}"></element-imageelement-usesrc></imageelement><p>First paragraph</p><p>Second paragraph</p>`
          );
        });
      });
    });

    describe("Checkbox field", () => {
      it(`should be clickable`, () => {
        addElement();
        getElementField("useSrc").find("input").click();
        getElementField("useSrc").find("input").should("be.checked");
      });

      it(`should have a default value when instantiated`, () => {
        addElement();
        assertDocHtml(
          `<imageelement type="imageElement" has-errors="false"><div class="ProsemirrorElement__imageElement-altText"><p></p></div><div class="ProsemirrorElement__imageElement-caption"><p></p></div><element-imageelement-usesrc class="ProsemirrorElement__imageElement-useSrc" fields="{&quot;value&quot;:false}"></element-imageelement-usesrc></imageelement><p>First paragraph</p><p>Second paragraph</p>`
        );
      });

      it(`should serialise state as field attributes on the appropriate node in the document - checked`, () => {
        addElement();
        getElementField("useSrc").find("input").click();
        assertDocHtml(
          `<imageelement type="imageElement" has-errors="false"><div class="ProsemirrorElement__imageElement-altText"><p></p></div><div class="ProsemirrorElement__imageElement-caption"><p></p></div><element-imageelement-usesrc class="ProsemirrorElement__imageElement-useSrc" fields="{&quot;value&quot;:true}"></element-imageelement-usesrc></imageelement><p>First paragraph</p><p>Second paragraph</p>`
        );
      });

      it(`should serialise state as field attributes on the appropriate node in the document - unchecked`, () => {
        addElement();
        getElementField("useSrc").find("input").click();
        getElementField("useSrc").find("input").click();
        assertDocHtml(
          `<imageelement type="imageElement" has-errors="false"><div class="ProsemirrorElement__imageElement-altText"><p></p></div><div class="ProsemirrorElement__imageElement-caption"><p></p></div><element-imageelement-usesrc class="ProsemirrorElement__imageElement-useSrc" fields="{&quot;value&quot;:false}"></element-imageelement-usesrc></imageelement><p>First paragraph</p><p>Second paragraph</p>`
        );
      });
    });
  });
});
