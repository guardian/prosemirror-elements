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

  const rteFields = ["caption", "altText"];
  const rteFieldStyles = [
    { title: "strong style", tag: "strong" },
    { title: "emphasis", tag: "em" },
  ];

  describe("Fields", () => {
    describe("Rich text field", () => {
      rteFields.forEach((field) => {
        it(`${field} – should accept input in an element`, () => {
          addElement();
          const text = `${field} text`;
          typeIntoElementField(field, text);
          getElementRichTextField(field).should("have.text", text);
        });

        it(`${field} – should create hard breaks on shift-enter`, () => {
          addElement();
          const text = `${field}{shift+enter}text`;
          typeIntoElementField(field, text);
          getElementRichTextField(field).should(($div) =>
            expect($div.html()).to.equal(`<p>${field}<br>text</p>`)
          );
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

        it(`${field} – should render new decorations, even if the document state has not changed`, () => {
          addElement();

          const oldDecoString = "deco";
          const newDecoString = "decoChanged";
          const text = `${field} ${oldDecoString} ${newDecoString}`;

          typeIntoElementField(field, text);
          changeTestDecoString(newDecoString);

          getElementRichTextField(field)
            .find(".TestDecoration")
            .should("have.text", newDecoString);

          changeTestDecoString(oldDecoString);

          getElementRichTextField(field)
            .find(".TestDecoration")
            .should("have.text", oldDecoString);
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
            getSerialisedHtml({
              altTextValue: "<p>Alt text</p>",
              captionValue: "<p>Caption text</p>",
            })
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
