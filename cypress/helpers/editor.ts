import { embedWrapperTestId } from "../../src/mounters/react/EmbedWrapper";
import { getPropFieldTestId } from "../../src/mounters/react/propFields/PropField";

export const selectDataCy = (id: string) => `[data-cy=${id}]`;

export const getElementType = (element: JQuery) => {
  if (element.prop("tagName") === "P") {
    return "paragraph";
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's not always truthy.
  if (element.find(selectDataCy(embedWrapperTestId))[0]) {
    return "embed";
  }
  return "unknown";
};

export const addEmbed = () => cy.get("#embed").click();

export const typeIntoProsemirror = (content: string) =>
  cy.get(`.ProseMirror`).type(content);

export const getEmbedRichTextField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getPropFieldTestId(fieldName))} .ProseMirror`);

export const getEmbedField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getPropFieldTestId(fieldName))}`);

export const getEmbedMenu = (fieldName: string) =>
  cy.get(
    `div${selectDataCy(getPropFieldTestId(fieldName))} .ProseMirror-menubar`
  );

export const getEmbedMenuButton = (fieldName: string, buttonTitle: string) =>
  cy.get(
    `div${selectDataCy(
      getPropFieldTestId(fieldName)
    )} .ProseMirror-menubar [title="${buttonTitle}"]`
  );

// If we don't focus the nested RTE we're typing into before type() is called,
// Cypress tends to type into the parent RTE instead.
export const typeIntoEmbedField = (fieldName: string, content: string) =>
  getEmbedRichTextField(fieldName).focus().type(content);

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
