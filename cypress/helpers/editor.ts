import { elementWrapperTestId } from "../../src/renderers/react/ElementWrapper";
import { getPropViewTestId } from "../../src/renderers/react/PropView";
import { trimHtml } from "../../src/testHelpers";

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

export const addElement = () => cy.get("#element").click();

export const typeIntoProsemirror = (content: string) =>
  cy.get(`.ProseMirror`).type(content);

export const getElementRichTextField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getPropViewTestId(fieldName))} .ProseMirror`);

export const getElementField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getPropViewTestId(fieldName))}`);

export const getElementMenu = (fieldName: string) =>
  cy.get(
    `div${selectDataCy(getPropViewTestId(fieldName))} .ProseMirror-menubar`
  );

export const getElementMenuButton = (fieldName: string, buttonTitle: string) =>
  cy.get(
    `div${selectDataCy(
      getPropViewTestId(fieldName)
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
    cy.get("#editor > .ProseMirror-menubar-wrapper > .ProseMirror")
      .children()
      .each(($el) => elementTypes.push(getElementType($el)))
      .then(() => resolve(elementTypes));
  });
};

export const assertDocHtml = (expectedHtml: string) =>
  cy.window().then((win) => {
    const actualHtml = ((win as unknown) as {
      docToHtml: () => string;
    }).docToHtml();
    expect(trimHtml(expectedHtml)).to.equal(actualHtml);
  });

export const getSerialisedHtml = ({
  altTextValue = "<p></p>",
  captionValue = "<p></p>",
  srcValue = "",
  useSrcValue = "false",
  optionValue = "opt1",
  mainImageValue = {
    assets: "[]",
    mediaId: undefined,
    mediaApiUri: undefined,
  },
}: {
  altTextValue?: string;
  captionValue?: string;
  srcValue?: string;
  useSrcValue?: string;
  optionValue?: string;
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
  return trimHtml(`<imageelement type="imageElement" has-errors="false">
    <element-imageelement-alttext class="ProsemirrorElement__imageElement-altText">${altTextValue}</element-imageelement-alttext>
    <element-imageelement-caption class="ProsemirrorElement__imageElement-caption">${captionValue}</element-imageelement-caption>
    <element-imageelement-mainimage class="ProsemirrorElement__imageElement-mainImage" fields="{${mainImageFields}}"></element-imageelement-mainimage>
    <element-imageelement-optiondropdown class="ProsemirrorElement__imageElement-optionDropdown" fields="&quot;${optionValue}&quot;"></element-imageelement-optiondropdown>
    <element-imageelement-src class="ProsemirrorElement__imageElement-src">${srcValue}</element-imageelement-src>
    <element-imageelement-usesrc class="ProsemirrorElement__imageElement-useSrc" fields="{&quot;value&quot;:${useSrcValue}}"></element-imageelement-usesrc>
  </imageelement><p>First paragraph</p><p>Second paragraph</p>`);
};
