import type { WindowType } from "../../demo/types";
import { getFieldHeadingTestId } from "../../src/editorial-source-components/InputHeading";
import { placeholderTestAttribute } from "../../src/plugin/helpers/placeholder";
import {
  ChangeTestDecoStringAction,
  trimHtml,
} from "../../src/plugin/helpers/test";
import { elementWrapperTestId } from "../../src/renderers/react/ElementWrapper";
import { getFieldViewTestId } from "../../src/renderers/react/FieldView";

export const visitRoot = () =>
  cy.visit("/", {
    onBeforeLoad: (win) => {
      // According to the docs, this shouldn't be necessary, but running specs
      // without it intermittently leaves localStorage populated, breaking tests.
      // https://docs.cypress.io/api/commands/clearlocalstorage#Syntax.
      win.localStorage.clear();
    },
  });

export const selectDataCy = (id: string) => `[data-cy=${id}]`;

export const getElementType = (element: JQuery) => {
  if (element.prop("tagName") === "P") {
    return "paragraph";
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's not always truthy.
  if (element.find(selectDataCy(elementWrapperTestId))[0]) {
    return "element";
  }
  return "unknown";
};

export const typeIntoProsemirror = (content: string) =>
  cy.get(`.ProseMirror`).type(content);

export const getElementRichTextField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getFieldViewTestId(fieldName))} .ProseMirror`);

export const getElementRichTextFieldPlaceholder = (fieldName: string) =>
  cy.get(
    `div${selectDataCy(
      getFieldViewTestId(fieldName)
    )} [data-cy=${placeholderTestAttribute}]`
  );

export const getElementField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getFieldViewTestId(fieldName))}`);

export const getElementHeading = (fieldName: string) =>
  cy.get(`div${selectDataCy(getFieldHeadingTestId(fieldName))}`);

export const getElementMenu = (fieldName: string) =>
  cy.get(
    `div${selectDataCy(getFieldViewTestId(fieldName))} .ProseMirror-menubar`
  );

export const getElementMenuButton = (fieldName: string, buttonTitle: string) =>
  cy.get(
    `div${selectDataCy(
      getFieldViewTestId(fieldName)
    )} .ProseMirror-menubar [title="${buttonTitle}"]`
  );

export const focusElementField = (fieldName: string) =>
  getElementRichTextField(fieldName).focus();

// If we don't focus the nested RTE we're typing into before type() is called,
// Cypress tends to type into the parent RTE instead.
export const typeIntoElementField = (fieldName: string, content: string) =>
  getElementRichTextField(fieldName).focus().type(content);

export const getArrayOfBlockElementTypes = () => {
  // eslint-disable-next-line prefer-const -- it is reassigned.
  let elementTypes = [] as string[];
  return new Cypress.Promise((resolve) => {
    cy.get(".Editor > .ProseMirror-menubar-wrapper > .ProseMirror")
      .children()
      .each(($el) => elementTypes.push(getElementType($el)))
      .then(() => resolve(elementTypes));
  });
};

export const assertDocHtml = (expectedHtml: string) =>
  cy.window().then((win: WindowType) => {
    const actualHtml = win.PM_ELEMENTS.docToHtml();
    expect(trimHtml(expectedHtml)).to.equal(actualHtml);
  });

export const getDocSelection = () =>
  cy.window().then((win: WindowType) => {
    const { from: docFrom, to: docTo } = win.PM_ELEMENTS.view.state.selection;
    return [docFrom, docTo];
  });

export const changeTestDecoString = (newTestString: string) => {
  cy.window().then((win: WindowType) => {
    const view = win.PM_ELEMENTS.view;
    view.dispatch(
      view.state.tr.setMeta(ChangeTestDecoStringAction, newTestString)
    );
  });
};

export const addImageElement = (values: Record<string, unknown> = {}) => {
  cy.window().then((win: WindowType) => {
    const { view, insertElement } = win.PM_ELEMENTS;
    insertElement({ elementName: "demo-image-element", values })(
      view.state,
      view.dispatch
    );
  });
};

export const clickButton = (id: string) =>
  cy.get(`button${selectDataCy(id)}`).click();

export const assertEditorFocus = (shouldBeFocused: boolean) => {
  cy.window().then((win: WindowType) => {
    const { view } = win.PM_ELEMENTS;
    expect(view.hasFocus()).to.equal(shouldBeFocused);
  });
};

type ElementFields = {
  altTextValue?: string;
  captionValue?: string;
  srcValue?: string;
  codeValue?: string;
  useSrcValue?: string;
  optionValue?: string;
  restrictedTextValue?: string;
  customDropdownValue?: string;
  mainImageValue?: {
    assets: string;
    mediaId?: string;
    mediaApiUri?: string;
  };
  repeaterValue?: Array<{
    repeaterText: string;
    nestedRepeater?: Array<{ nestedRepeaterText: string }>;
  }>;
};

export const setDocFromHtml = (fields: ElementFields) => {
  cy.window().then((win: WindowType) => {
    const { htmlToDoc } = win.PM_ELEMENTS;
    htmlToDoc(getSerialisedHtml(fields));
  });
};

export const getSerialisedHtml = ({
  altTextValue = "",
  captionValue = "<p></p>",
  srcValue = "",
  codeValue = "",
  useSrcValue = "false",
  optionValue = "opt1",
  restrictedTextValue = "",
  customDropdownValue = "opt1",
  mainImageValue = {
    assets: "[]",
    mediaId: undefined,
    mediaApiUri: undefined,
  },
  repeaterValue = [],
}: ElementFields): string => {
  const mainImageFields =
    mainImageValue.mediaId || mainImageValue.mediaApiUri
      ? `&quot;mediaId&quot;:&quot;${
          mainImageValue.mediaId ?? "undefined"
        }&quot;&quot;mediaApiUri&quot;:&quot;${
          mainImageValue.mediaApiUri ?? "undefined"
        }&quot;,&quot;assets&quot;${mainImageValue.assets}`
      : `&quot;assets&quot;:[]`;
  return trimHtml(`<div pme-element-type="demo_image_element">
    <div pme-field-name="demo_image_element__altText">${altTextValue}</div>
    <div pme-field-name="demo_image_element__caption">${captionValue}</div>
    <div pme-field-name="demo_image_element__code">${codeValue}</div>
    <div pme-field-name="demo_image_element__customDropdown" fields="&quot;${customDropdownValue}&quot;"></div>
    <div pme-field-name="demo_image_element__mainImage" fields="{${mainImageFields}}"></div>
    <div pme-field-name="demo_image_element__optionDropdown" fields="&quot;${optionValue}&quot;"></div>
    <div pme-field-name="demo_image_element__repeater__parent">
        ${repeaterValue
          .map(
            (value) => `
          <div pme-field-name="demo_image_element__repeater__child">
            <div pme-field-name="demo_image_element__nestedRepeater__parent">
            ${(value.nestedRepeater ?? [])
              .map(
                (nestedRepeaterValue) => `
              <div pme-field-name="demo_image_element__nestedRepeater__child">
                <div pme-field-name="demo_image_element__nestedRepeaterText">${nestedRepeaterValue.nestedRepeaterText}</div>
              </div>`
              )
              .join("")}</div>
            <div pme-field-name="demo_image_element__repeaterText">${
              value.repeaterText
            }</div>
          </div>
        `
          )
          .join("")}
    </div>
    <div pme-field-name="demo_image_element__resizeable"></div>
    <div pme-field-name="demo_image_element__restrictedTextField">${restrictedTextValue}</div>
    <div pme-field-name="demo_image_element__src">${srcValue}</div>
    <div pme-field-name="demo_image_element__useSrc" fields="${useSrcValue}"></div>
  </div><p>First paragraph</p><p>Second paragraph</p>`);
};

export const boldShortcut = () => {
  switch (Cypress.platform) {
    case "darwin":
      return "{meta+b}";
    default:
      return "{ctrl+b}";
  }
};

export const italicShortcut = () => {
  switch (Cypress.platform) {
    case "darwin":
      return "{meta+i}";
    default:
      return "{ctrl+i}";
  }
};

export const selectAllShortcut = () => {
  switch (Cypress.platform) {
    case "darwin":
      return "{meta+a}";
    default:
      return "{ctrl+a}";
  }
};
