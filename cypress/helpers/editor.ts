import { elementWrapperTestId } from "../../src/renderers/react/ElementWrapper";
import { getPropViewTestId } from "../../src/renderers/react/PropView";

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
    expect(expectedHtml).to.equal(actualHtml);
  });
