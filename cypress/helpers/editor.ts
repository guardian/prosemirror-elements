import type { WindowType } from "../../demo/types";
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

export const getElementField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getFieldViewTestId(fieldName))}`);

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
    insertElement({ elementName: "imageElement", values })(
      view.state,
      view.dispatch
    );
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
}: {
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
}): string => {
  const mainImageFields =
    mainImageValue.mediaId || mainImageValue.mediaApiUri
      ? `&quot;mediaId&quot;:&quot;${
          mainImageValue.mediaId ?? "undefined"
        }&quot;&quot;mediaApiUri&quot;:&quot;${
          mainImageValue.mediaApiUri ?? "undefined"
        }&quot;,&quot;assets&quot;${mainImageValue.assets}`
      : `&quot;assets&quot;:[]`;
  return trimHtml(`<div pm-elements-element-type="imageElement" has-errors="false">
    <div pm-elements-field-name="imageElement_altText">${altTextValue}</div>
    <div pm-elements-field-name="imageElement_caption">${captionValue}</div>
    <div pm-elements-field-name="imageElement_code">${codeValue}</div>
    <div pm-elements-field-name="imageElement_customDropdown" fields="&quot;${customDropdownValue}&quot;"></div>
    <div pm-elements-field-name="imageElement_mainImage" fields="{${mainImageFields}}"></div>
    <div pm-elements-field-name="imageElement_optionDropdown" fields="&quot;${optionValue}&quot;"></div>
    <div pm-elements-field-name="imageElement_restrictedTextField">${restrictedTextValue}</div>
    <div pm-elements-field-name="imageElement_src">${srcValue}</div>
    <div pm-elements-field-name="imageElement_useSrc" fields="${useSrcValue}"></div>
  </div><p>First paragraph</p><p>Second paragraph</p>`);
};
