import { UpdateAltTextButtonId } from "../../src/elements/demo-image/DemoImageElementForm";
import {
  addImageElement,
  assertDocHtml,
  boldShortcut,
  changeTestDecoString,
  focusElementField,
  getDocSelection,
  getElementField,
  getElementHeading,
  getElementMenuButton,
  getElementRichTextField,
  getElementRichTextFieldPlaceholder,
  getSerialisedHtml,
  italicShortcut,
  selectAllShortcut,
  selectDataCy,
  setDocFromHtml,
  typeIntoElementField,
  visitRoot,
} from "../helpers/editor";

describe("ImageElement", () => {
  beforeEach(visitRoot);

  const rteFieldStyles = [
    { title: "strong style", tag: "strong" },
    { title: "emphasis", tag: "em" },
  ];

  describe("Fields", () => {
    describe("Rich text field", () => {
      it("should update the document selection when the user focuses on the field – initial field", () => {
        addImageElement();
        getDocSelection().then(([from]) => {
          // The selection should be just after the inserted element
          expect(from).to.be.greaterThan(5);
        });
        focusElementField("caption");
        getDocSelection().then(([from, to]) => {
          // The selection should be at the first field of the element
          expect(from).to.equal(5);
          expect(to).to.equal(5);
        });
      });
      it("should update the document selection when the user focuses on the field and it contains content, even if the inner field's selection has not changed", () => {
        addImageElement();
        getDocSelection().then(([from]) => {
          // The selection should be just after the inserted element
          expect(from).to.be.greaterThan(13);
        });
        typeIntoElementField("caption", "Example");
        focusElementField("caption");
        focusElementField("src");

        getDocSelection().then(([from]) => {
          // The selection should have moved from the field
          expect(from).to.not.equal(12);
        });

        // We click to ensure we select the end of the text, where the cursor would have previously been
        getElementRichTextField("caption").click();
        getDocSelection().then(([from, to]) => {
          // The selection should be at the end of the field
          expect(from).to.equal(12);
          expect(to).to.equal(12);
        });
      });
      it("should update the document selection when the user focuses on the field – subsequent field", () => {
        addImageElement();
        getDocSelection().then(([from]) => {
          // The selection should be just after the inserted element
          expect(from).to.be.greaterThan(13);
        });
        focusElementField("src");
        getDocSelection().then(([from, to]) => {
          // The selection should be at the first field of the element
          expect(from).to.equal(17);
          expect(to).to.equal(17);
        });
      });
      it(`caption – should have a placeholder`, () => {
        addImageElement();
        getElementRichTextFieldPlaceholder("caption").should(
          "have.text",
          "Enter caption"
        );
      });
      it(`caption – should accept input in an element`, () => {
        addImageElement();
        const text = `caption text`;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption").should("have.text", text);
      });

      it(`caption – should allow mark shortcuts in an element`, () => {
        addImageElement();
        const text = `text with ${boldShortcut()}bold and ${boldShortcut()}${italicShortcut()}italic`;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption").should(
          "have.html",
          "<p>text with <strong>bold and </strong><em>italic</em></p>"
        );
      });

      it(`caption – should create hard breaks on shift-enter`, () => {
        addImageElement();
        const text = `caption{shift+enter}text`;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption").should(($div) =>
          expect($div.html()).to.equal(`<p>caption<br>text</p>`)
        );
      });

      it(`caption – should render decorations passed from the parent editor`, () => {
        addImageElement();
        const text = `caption deco `;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should map decorations passed from the parent editor correctly when they move – add text before`, () => {
        addImageElement();
        typeIntoElementField(
          "caption",
          "start deco{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow} more"
        );
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should map decorations passed from the parent editor correctly when they move – add text after`, () => {
        addImageElement();
        typeIntoElementField("caption", "caption deco more text");
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should map decorations passed from the parent editor correctly when they move – remove text before`, () => {
        addImageElement();
        typeIntoElementField(
          "caption",
          "start deco{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{backspace}{backspace}"
        );
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should map decorations passed from the parent editor correctly when they move – remove text after`, () => {
        addImageElement();
        typeIntoElementField(
          "caption",
          "caption deco more text {backspace}{backspace}"
        );
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should map decorations passed from the parent editor correctly when they move – add text in following field`, () => {
        addImageElement();
        typeIntoElementField("caption", "caption deco");
        typeIntoElementField("altText", "text");
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should map decorations passed from the parent editor correctly when they move – remove text in following field`, () => {
        addImageElement();
        typeIntoElementField("caption", "caption deco");
        typeIntoElementField("altText", "text{backspace}{backspace}");
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should render new decorations, even if the document state has not changed`, () => {
        addImageElement();

        const oldDecoString = "deco";
        const newDecoString = "decoChanged";
        const text = `caption ${oldDecoString} ${newDecoString}`;

        typeIntoElementField("caption", text);
        changeTestDecoString(newDecoString);

        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", newDecoString);

        changeTestDecoString(oldDecoString);

        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", oldDecoString);
      });

      rteFieldStyles.forEach((style) => {
        it(`caption – should toggle style of an input in an element`, () => {
          addImageElement();
          getElementMenuButton("caption", `Toggle ${style.title}`).click();
          typeIntoElementField("caption", "Example text");
          getElementRichTextField("caption")
            .find(style.tag)
            .should("have.text", "Example text");
        });
      });

      it(`restrictedTextField – can toggle italic style of an input in an element`, () => {
        addImageElement();
        getElementMenuButton("restrictedTextField", "Toggle emphasis").click();
        typeIntoElementField("restrictedTextField", "Example text");
        getElementRichTextField("restrictedTextField")
          .find("em")
          .should("have.text", "Example text");
      });

      it(`restrictedTextField – can't toggle strong style of an input in an element`, () => {
        addImageElement();
        getElementMenuButton(
          "restrictedTextField",
          "Toggle strong style"
        ).click();
        typeIntoElementField("restrictedTextField", "Example text");
        getElementRichTextField("restrictedTextField").should(
          "not.contain.html",
          "<strong>"
        );
      });

      it(`restrictedTextField – creates br tags, not new paragraphs`, () => {
        addImageElement();
        typeIntoElementField("restrictedTextField", "Example {Enter}text");
        assertDocHtml(
          getSerialisedHtml({
            restrictedTextValue: "Example <br>text",
          })
        );
      });

      it("should serialise content as HTML within the appropriate nodes in the document", () => {
        addImageElement();
        typeIntoElementField("caption", "Caption text");
        typeIntoElementField("altText", "Alt text");
        assertDocHtml(
          getSerialisedHtml({
            altTextValue: "Alt text",
            captionValue: "<p>Caption text</p>",
          })
        );
      });

      it("should deserialise content from HTML into the appropriate node in the document", () => {
        const values = { altTextValue: "Alt text" };
        setDocFromHtml(values);
        assertDocHtml(getSerialisedHtml(values));
      });

      it("should select all of its text when the select all shortcut is used", () => {
        addImageElement({
          caption: "Here is some text we'd like to delete.",
          src: "The remaining field.",
        });
        typeIntoElementField("caption", `${selectAllShortcut()}{backspace}`);

        getElementRichTextField("caption").should("have.text", "Enter caption");
        getElementRichTextField("src").should(
          "have.text",
          "The remaining field."
        );
      });

      it("should select the correct range in ProseMirror when the select all shortcut is used within the field", () => {
        addImageElement({
          caption: "Hello, world.",
          src: "Foobar.",
        });
        typeIntoElementField("caption", `${selectAllShortcut()}`);

        getDocSelection().then(([from, to]) => {
          expect(from).to.equal(5);
          expect(to).to.equal(18);
        });
      });
    });

    describe("Text field", () => {
      it(`should have a placeholder`, () => {
        addImageElement();
        getElementRichTextFieldPlaceholder("src").should(
          "have.text",
          "Add src"
        );
      });

      it(`should accept input in an element`, () => {
        addImageElement();
        const text = `Src text`;
        typeIntoElementField("src", text);
        getElementRichTextField("src").should("have.text", text);
      });

      it(`should ignore mark shortcuts`, () => {
        addImageElement();

        const text = `${boldShortcut()}bold text ${boldShortcut()}${italicShortcut()}italic text`;
        typeIntoElementField("src", text);
        getElementRichTextField("src").should(
          "have.html",
          "bold text italic text"
        );
      });

      it(`should treat html tags as text, not html`, () => {
        addImageElement({
          src: "<strong>bold text</strong> <em>italic text</em>",
        });
        getElementRichTextField("src").should(
          "have.text",
          "<strong>bold text</strong> <em>italic text</em>"
        );
      });

      it("should serialise content as HTML within the appropriate nodes in the document", () => {
        addImageElement();
        typeIntoElementField("src", "Src text");
        assertDocHtml(getSerialisedHtml({ srcValue: "Src text" }));
      });

      it(`should not create line breaks when isMultiline is not set`, () => {
        addImageElement();
        const text = `Src {enter}text`;
        typeIntoElementField("src", text);
        assertDocHtml(getSerialisedHtml({ srcValue: "Src text" }));
      });

      it(`should create line breaks when isMultiline is set`, () => {
        addImageElement();
        const text = `Alttext {enter}text`;
        typeIntoElementField("altText", text);
        assertDocHtml(getSerialisedHtml({ altTextValue: "Alttext <br>text" }));
      });

      it(`should create newlines and preserve whitespace when isMultiline and isCode are set`, () => {
        addImageElement();
        const text = `Code {enter} text`;
        typeIntoElementField("code", text);
        assertDocHtml(getSerialisedHtml({ codeValue: "Code \n text" }));
      });

      it(`should create newlines and preserve whitespace when isMultiline and isCode are set`, () => {
        addImageElement({ code: "Code \n text" });
        assertDocHtml(getSerialisedHtml({ codeValue: "Code \n text" }));
      });

      it(`should not reach its max height when text has fewer rows than the number of lines specified by maxRows`, () => {
        addImageElement({ code: "Code \n \n \n \n \n text" });
        getElementRichTextField("code")
          .invoke("css", "height")
          .then((height) =>
            getElementRichTextField("code")
              .invoke("css", "max-height")
              // Chained expressions here allow us to compare numerical value of string px properties
              .then((maxHeight) => parseInt(maxHeight.toString()))
              .should("be.above", parseInt(height.toString()))
          );
      });

      it(`should visually extend no more than the number of lines specified by maxRows`, () => {
        addImageElement({ code: "Code \n \n \n \n \n \n \n \n \n \n \n text" });
        getElementRichTextField("code")
          .invoke("css", "height")
          .then((height) =>
            getElementRichTextField("code")
              .invoke("css", "max-height")
              .should("equal", height)
          );
      });

      describe("Resizeable fields", () => {
        it("should be resizeable", () => {
          addImageElement();
          getElementRichTextField("resizeable")
            .invoke("css", "resize")
            .then((resize) => {
              expect(resize).to.be.equal("vertical");
            });
        });

        it("should visually extend no more than the number of lines specified by `rows` when resizeable", () => {
          addImageElement();
          typeIntoElementField(
            "resizeable",
            "{Enter}{Enter}{Enter}{Enter}{Enter}"
          );
          getElementRichTextField("resizeable")
            .invoke("css", "height")
            .then((height) => {
              const heightAsNumber = parseInt(
                (height as unknown) as string,
                10
              );
              // Proxy: height should be less than the five lines we've entered above
              expect(heightAsNumber).to.be.lessThan(50);
            });
        });
      });

      it("should serialise content as HTML within the appropriate nodes in the document", () => {
        addImageElement();
        typeIntoElementField("src", "Src text");
        assertDocHtml(getSerialisedHtml({ srcValue: "Src text" }));
      });

      it("should deserialise content from HTML into the appropriate node in the document", () => {
        const values = { srcValue: "Src text" };
        setDocFromHtml(values);
        assertDocHtml(getSerialisedHtml(values));
      });

      it("should select all of its text when the select all shortcut is used", () => {
        addImageElement({
          caption: "The remaining field.",
          src: "Here is some text we'd like to delete.",
        });
        typeIntoElementField("src", `${selectAllShortcut()}{backspace}`);

        getElementRichTextField("src").should("have.text", "Add src");
        getElementRichTextField("caption").should(
          "have.text",
          "The remaining field."
        );
      });

      it("should select the correct range in ProseMirror when the select all shortcut is used within the field", () => {
        addImageElement({
          caption: "Hello, world.",
          src: "Foobar.",
        });
        typeIntoElementField("src", `${selectAllShortcut()}`);

        getDocSelection().then(([from, to]) => {
          // The selection should be at the first field of the element
          expect(from).to.equal(30);
          expect(to).to.equal(37);
        });
      });
    });

    describe("Checkbox field", () => {
      it(`should be clickable`, () => {
        addImageElement();
        getElementField("useSrc").find("input").click();
        getElementField("useSrc").find("input").should("be.checked");
      });

      it(`should have a default value when instantiated`, () => {
        addImageElement();
        assertDocHtml(getSerialisedHtml({}));
      });

      it(`should serialise state as field attributes on the appropriate node in the document - checked`, () => {
        addImageElement();
        getElementField("useSrc").find("input").click();
        assertDocHtml(getSerialisedHtml({ useSrcValue: "true" }));
      });

      it(`should serialise state as field attributes on the appropriate node in the document - unchecked`, () => {
        addImageElement();
        getElementField("useSrc").find("input").click();
        getElementField("useSrc").find("input").click();
        assertDocHtml(getSerialisedHtml({ useSrcValue: "false" }));
      });

      it(`should track the field offset, and update correctly after fields above have changed`, () => {
        addImageElement();

        getElementField("useSrc").find("input").click();
        typeIntoElementField("altText", "Example text");
        getElementField("useSrc").find("input").click();

        assertDocHtml(
          getSerialisedHtml({
            altTextValue: "Example text",
            useSrcValue: "false",
          })
        );
      });
    });

    describe("Dropdown field", () => {
      it(`should change the option selected in the document when a user selects a new option`, () => {
        addImageElement();
        getElementField("optionDropdown")
          .find("select")
          .select(JSON.stringify("opt2"));
        getElementField("optionDropdown")
          .find("select")
          .children("option:selected")
          .should("have.value", JSON.stringify("opt2"));
      });

      it(`should have a default value when instantiated`, () => {
        addImageElement();
        assertDocHtml(getSerialisedHtml({}));
        assertDocHtml(getSerialisedHtml({ optionValue: "opt1" }));
      });

      it(`should serialise state as field attributes on the appropriate node in the document when a new option is selected`, () => {
        addImageElement();
        getElementField("optionDropdown")
          .find("select")
          .select(JSON.stringify("opt2"));
        assertDocHtml(getSerialisedHtml({ optionValue: "opt2" }));
      });
    });

    describe("CustomDropdown field", () => {
      it(`should have a default value when instantiated`, () => {
        addImageElement();
        assertDocHtml(getSerialisedHtml({}));
        assertDocHtml(getSerialisedHtml({ customDropdownValue: "opt1" }));
      });

      it(`should serialise state as field attributes on the appropriate node in the document when a new option is selected`, () => {
        addImageElement();
        getElementField("customDropdown").find("select").select("opt2");
        // Wait for the document to be updated after the selection is made
        cy.wait(100);

        assertDocHtml(getSerialisedHtml({ customDropdownValue: "opt2" }));
      });
    });

    describe("Programmatically update fields", () => {
      it("should revert the alt text to 'Default alt text' when the button is clicked", () => {
        addImageElement();
        cy.get(`button${selectDataCy(UpdateAltTextButtonId)}`).click();
        getElementRichTextField("altText").should(
          "have.text",
          "Default alt text"
        );
      });
    });

    describe("Validation behaviour", () => {
      it("should display the alt text as required", () => {
        addImageElement();
        getElementHeading("altText").should("exist");
      });
      it("should remove the alt text required warning", () => {
        addImageElement();
        typeIntoElementField("altText", "text");
        getElementHeading("altText").contains("Required").should("not.exist");
      });
      it("should display the alt text as too long", () => {
        addImageElement();
        typeIntoElementField("altText", "text ".repeat(25));
        getElementHeading("altText").contains("Too long").should("exist");
      });
      it("should update the alt text validation", () => {
        addImageElement();
        typeIntoElementField("altText", "a");
        getElementHeading("altText").contains("Required").should("not.exist");
        typeIntoElementField("altText", "{backspace}");
        getElementHeading("altText").contains("Required").should("exist");
      });
    });
  });
});
