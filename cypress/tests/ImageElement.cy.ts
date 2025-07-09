import {
  AddNestedRepeaterButtonId,
  AddRepeaterButtonId,
  RemoveNestedRepeaterButtonId,
  RemoveRepeaterButtonId,
  UpdateAltTextButtonId,
} from "../../src/elements/demo-image/DemoImageElementForm";
import {
  addImageElement,
  assertCaretPosition,
  assertDocHtml,
  boldShortcut,
  changeTestDecoString,
  clickButton,
  focusElementField,
  getButton,
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
  setStoredMark,
  setStrongStoredMark,
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
          expect(from).to.equal(19);
          expect(to).to.equal(19);
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

      it(`caption - should apply a storedMark to a character if one is specified by the outer editor`, () => {
        addImageElement();
        const focusedField = getElementRichTextField("caption").focus();
        setStrongStoredMark();
        focusedField.type("a");
        getElementRichTextField("caption").should(
          "have.html",
          "<p><strong>a</strong></p>"
        );
      });

      it(`caption - should stop applying an existing stored mark when the outer editor has an empty array as its stored marks`, () => {
        addImageElement();
        const focusedField = getElementRichTextField("caption").focus();
        setStrongStoredMark();
        focusedField.type("a");
        setStoredMark([]);
        focusedField.type("b");
        getElementRichTextField("caption").should(
          "have.html",
          "<p><strong>a</strong>b</p>"
        );
      });

      it(`caption - should not apply a stored mark when the outer editor has null as its stored mark`, () => {
        addImageElement();
        const focusedField = getElementRichTextField("caption").focus();
        setStrongStoredMark();
        setStoredMark(null);
        focusedField.type("ab");
        getElementRichTextField("caption").should("have.html", "<p>ab</p>");
      });

      rteFieldStyles.forEach((style) => {
        it(`caption – should toggle style of an input in an element`, () => {
          addImageElement();

          // This is not necessary outside of integration tests. Unclear why at present.
          focusElementField("caption");

          getElementMenuButton("caption", `Toggle ${style.title}`).click();
          typeIntoElementField("caption", "Example text");
          getElementRichTextField("caption")
            .find(style.tag)
            .should("have.text", "Example text");
        });
      });

      it(`restrictedTextField – can toggle italic style of an input in an element`, () => {
        addImageElement();

        // This is not necessary outside of integration tests. Unclear why at present.
        focusElementField("restrictedTextField");

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
        ).should("not.be.visible");
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
          expect(from).to.equal(32);
          expect(to).to.equal(39);
        });
      });

      it("should prevent the caret moving from one text to another with up arrow", () => {
        addImageElement({
          caption: "A long caption that you might move around using arrow keys",
          src: "Foobar.",
        });
        focusElementField("src");
        // The caret should be at the start of the text block
        assertCaretPosition(77);

        typeIntoElementField("src", "{rightArrow}");
        assertCaretPosition(78);

        typeIntoElementField("src", "{upArrow}");
        assertCaretPosition(77);
      });

      it("should prevent the caret moving from one text to another with left arrow", () => {
        addImageElement({
          caption: "A long caption that you might move around using arrow keys",
          src: "Foobar.",
        });

        focusElementField("src");
        // The caret should be at the start of the text block
        assertCaretPosition(77);

        typeIntoElementField("src", "{rightArrow}");
        assertCaretPosition(78);

        for (let i = 0; i < 3; i++) {
          typeIntoElementField("src", "{leftArrow}");
        }

        assertCaretPosition(77);
      });

      it("should prevent the caret moving from one text to another with down arrow", () => {
        addImageElement({
          caption: "A long caption that you might move around using arrow keys",
          src: "Foobar.",
        });
        focusElementField("src");
        // The caret should be at the start of the text block
        assertCaretPosition(77);

        typeIntoElementField("src", "{downArrow}");
        assertCaretPosition(84);
      });

      it("should prevent the caret moving from one text to another with right arrow", () => {
        addImageElement({
          caption: "A long caption that you might move around using arrow keys",
          src: "Foobar.",
        });
        focusElementField("src");
        // The caret should be at the start of the text block
        assertCaretPosition(77);

        for (let i = 0; i < 15; i++) {
          typeIntoElementField("src", "{rightArrow}");
        }

        assertCaretPosition(84);
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

    describe("Repeater behaviour", () => {
      it("should add repeater elements", () => {
        addImageElement({
          repeater: [
            {
              repeaterText: "Example repeater text 1",
            },
          ],
        });
        getElementRichTextField("repeaterText").its("length").should("eq", 1);
        const addRepeaterButtons = getButton(AddRepeaterButtonId);
        addRepeaterButtons.first().click();
        getElementRichTextField("repeaterText").its("length").should("eq", 2);
      });
      it("should remove repeater elements", () => {
        addImageElement({
          repeater: [
            {
              repeaterText: "Example repeater text 1",
            },
            { repeaterText: "Example repeater text 2" },
          ],
        });
        getElementRichTextField("repeaterText").its("length").should("eq", 2);
        getButton(RemoveRepeaterButtonId).first().click();
        getElementRichTextField("repeaterText").its("length").should("eq", 1);
        clickButton(RemoveRepeaterButtonId);
        getElementRichTextField("repeaterText").should("not.exist");
      });
      it("should accept values in repeater elements", () => {
        addImageElement({
          repeater: [
            {
              repeaterText: "",
            },
          ],
        });
        typeIntoElementField("repeaterText", "Repeater value");
        assertDocHtml(
          getSerialisedHtml({
            repeaterValue: [
              {
                repeaterText: "Repeater value",
              },
            ],
          })
        );
      });
      it("should add nested repeater elements", () => {
        addImageElement({
          repeater: [
            {
              repeaterText: "Example repeater text 1",
              nestedRepeater: [
                { nestedRepeaterText: "Example nested repeater text 1" },
              ],
            },
          ],
        });
        getElementRichTextField("nestedRepeaterText")
          .its("length")
          .should("eq", 1);
        clickButton(AddNestedRepeaterButtonId);
        getElementRichTextField("nestedRepeaterText")
          .its("length")
          .should("eq", 2);
      });
      it("should remove nested repeater elements", () => {
        addImageElement({
          repeater: [
            {
              repeaterText: "Example repeater text 1",
              nestedRepeater: [
                { nestedRepeaterText: "Example nested repeater text 1" },
                { nestedRepeaterText: "Example nested repeater text 2" },
              ],
            },
          ],
        });
        getElementRichTextField("nestedRepeaterText")
          .its("length")
          .should("eq", 2);
        getButton(RemoveNestedRepeaterButtonId).first().click();
        getElementRichTextField("nestedRepeaterText")
          .its("length")
          .should("eq", 1);
        clickButton(RemoveNestedRepeaterButtonId);
        getElementRichTextField("nestedRepeaterText").should("not.exist");
      });
      it("should accept values in nested repeater elements", () => {
        addImageElement({
          repeater: [
            {
              repeaterText: "",
              nestedRepeater: [{ nestedRepeaterText: "" }],
            },
          ],
        });
        typeIntoElementField("nestedRepeaterText", "Repeater value");
        assertDocHtml(
          getSerialisedHtml({
            repeaterValue: [
              {
                repeaterText: "",
                nestedRepeater: [{ nestedRepeaterText: "Repeater value" }],
              },
            ],
          })
        );
      });
    });
  });
});
