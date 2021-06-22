import {
  addElement,
  assertDocHtml,
  getElementField,
  getElementMenuButton,
  getElementRichTextField,
  getSerialisedHtml,
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
            `<imageelement type="imageElement" has-errors="false">
              <element-imageelement-alttext class="ProsemirrorElement__imageElement-altText"><p>Alt text</p></element-imageelement-alttext>
              <element-imageelement-caption class="ProsemirrorElement__imageElement-caption"><p>Caption text</p></element-imageelement-caption>
              <element-imageelement-mainimage class="ProsemirrorElement__imageElement-mainImage" fields="{&quot;src&quot;:&quot;&quot;}"></element-imageelement-mainimage>
              <element-imageelement-src class="ProsemirrorElement__imageElement-src"></element-imageelement-src>
              <element-imageelement-usesrc class="ProsemirrorElement__imageElement-useSrc" fields="{&quot;value&quot;:false}"></element-imageelement-usesrc>
            </imageelement>
            <p>First paragraph</p>
            <p>Second paragraph</p>`
          );
        });
      });
    });

    describe("Text field", () => {
      it(`src – should accept input in an element`, () => {
        addElement();
        const text = `Src text`;
        typeIntoElementField("src", text);
        getElementRichTextField("src").should("have.text", text);
      });

      it("should serialise content as HTML within the appropriate nodes in the document", () => {
        addElement();
        typeIntoElementField("src", "Src text");
        assertDocHtml(getSerialisedHtml({ srcValue: "Src text" }));
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
        assertDocHtml(getSerialisedHtml({}));
      });

      it(`should serialise state as field attributes on the appropriate node in the document - checked`, () => {
        addElement();
        getElementField("useSrc").find("input").click();
        assertDocHtml(getSerialisedHtml({ useSrcValue: "true" }));
      });

      it(`should serialise state as field attributes on the appropriate node in the document - unchecked`, () => {
        addElement();
        getElementField("useSrc").find("input").click();
        getElementField("useSrc").find("input").click();
        assertDocHtml(getSerialisedHtml({ useSrcValue: "false" }));
      });

      it(`should track the field offset, and update correctly after fields above have changed`, () => {
        addElement();

        getElementField("useSrc").find("input").click();
        typeIntoElementField("altText", "Example text");
        getElementField("useSrc").find("input").click();

        assertDocHtml(
          getSerialisedHtml({
            altTextValue: "<p>Example text</p>",
            useSrcValue: "false",
          })
        );
      });
    });

    describe("Custom element – image src", () => {
      it(`should serialise state as field attributes on the appropriate node in the document`, () => {
        addElement();
        getElementField("mainImage").find("input").type("http://an-image.png");
        assertDocHtml(
          getSerialisedHtml({ mainImageValue: "http://an-image.png" })
        );
      });
    });
  });
});
