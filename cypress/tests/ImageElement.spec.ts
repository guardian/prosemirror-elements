import {
  addElement,
  assertDocHtml,
  changeTestDecoString,
  getElementField,
  getElementMenuButton,
  getElementRichTextField,
  getSerialisedHtml,
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
      it(`caption – should accept input in an element`, () => {
        addElement();
        const text = `caption text`;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption").should("have.text", text);
      });

      it(`caption – should create hard breaks on shift-enter`, () => {
        addElement();
        const text = `caption{shift+enter}text`;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption").should(($div) =>
          expect($div.html()).to.equal(`<p>caption<br>text</p>`)
        );
      });

      it(`caption – should render decorations passed from the parent editor`, () => {
        addElement();
        const text = `caption deco `;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should map decorations passed from the parent editor correctly when they move`, () => {
        addElement();
        const text = `caption deco{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow} more text`;
        typeIntoElementField("caption", text);
        getElementRichTextField("caption")
          .find(".TestDecoration")
          .should("have.text", "deco");
      });

      it(`caption – should render new decorations, even if the document state has not changed`, () => {
        addElement();

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
          addElement();
          getElementMenuButton("caption", `Toggle ${style.title}`).click();
          typeIntoElementField("caption", "Example text");
          getElementRichTextField("caption")
            .find(style.tag)
            .should("have.text", "Example text");
        });
      });

      it("should serialise content as HTML within the appropriate nodes in the document", () => {
        addElement();
        typeIntoElementField("caption", "Caption text");
        typeIntoElementField("altText", "Alt text");
        assertDocHtml(
          getSerialisedHtml({
            altTextValue: "Alt text",
            captionValue: "<p>Caption text</p>",
          })
        );
      });
    });

    describe("Text field", () => {
      it(`should accept input in an element`, () => {
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

      it(`should not create line breaks when isMultiline is not set`, () => {
        addElement();
        const text = `Src {enter}text`;
        typeIntoElementField("src", text);
        assertDocHtml(getSerialisedHtml({ srcValue: "Src text" }));
      });

      it(`should create line breaks when isMultiline is set`, () => {
        addElement();
        const text = `Alttext {enter}text`;
        typeIntoElementField("altText", text);
        assertDocHtml(getSerialisedHtml({ altTextValue: "Alttext <br>text" }));
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
            altTextValue: "Example text",
            useSrcValue: "false",
          })
        );
      });
    });

    describe("Dropdown field", () => {
      it(`should change the option selected in the document when a user selects a new option`, () => {
        addElement();
        getElementField("optionDropdown")
          .find("select")
          .select(JSON.stringify("opt2"));
        getElementField("optionDropdown")
          .find("select")
          .children("option:selected")
          .should("have.value", JSON.stringify("opt2"));
      });

      it(`should have a default value when instantiated`, () => {
        addElement();
        assertDocHtml(getSerialisedHtml({}));
        assertDocHtml(getSerialisedHtml({ optionValue: "opt1" }));
      });

      it(`should serialise state as field attributes on the appropriate node in the document when a new option is selected`, () => {
        addElement();
        getElementField("optionDropdown")
          .find("select")
          .select(JSON.stringify("opt2"));
        assertDocHtml(getSerialisedHtml({ optionValue: "opt2" }));
      });
    });

    describe("CustomDropdown field", () => {
      it(`should have a default value when instantiated`, () => {
        addElement();
        assertDocHtml(getSerialisedHtml({}));
        assertDocHtml(getSerialisedHtml({ customDropdownValue: "opt1" }));
      });

      it(`should serialise state as field attributes on the appropriate node in the document when a new option is selected`, () => {
        addElement();
        getElementField("customDropdown").find("select").select("opt2");
        assertDocHtml(getSerialisedHtml({ customDropdownValue: "opt2" }));
      });
    });
  });
});
