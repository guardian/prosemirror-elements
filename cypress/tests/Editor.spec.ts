import { typeIntoProsemirror } from "../helpers/editor";

describe("Core editor behaviour", () => {
  beforeEach(() => cy.visit("/"));

  it("should accept editor input", () => {
    typeIntoProsemirror("{selectall}Text");
    cy.get(".ProseMirror > p").should("have.text", "Text");
  });

  it("should persist user input in localstorage", () => {
    typeIntoProsemirror("{selectall}Text");
    cy.reload();
    cy.get(".ProseMirror > p").should("have.text", "Text");
  });
});
