import type { WindowType } from "../../demo/types";
import {
  addAltStyleElement,
  getElementRichTextField,
  typeIntoElementField,
  visitRoot,
} from "../helpers/editor";

describe("should propagate events from inner editors to outer editor, so plugins etc. receive them'", () => {
  beforeEach(visitRoot);

  const startingPoint = {
    repeater: [
      {
        title: "",
        content: [],
      },
    ],
  };

  it("single clicks have access to the whole doc", () => {
    addAltStyleElement(startingPoint); // add an element with an inner editor

    getElementRichTextField("content").click();

    cy.window().then((win: WindowType) => {
      // @ts-expect-error - just using for testing so don't want to add to the window type
      expect(win.viewPassedToPlugin).to.equal(win.PM_ELEMENTS.view);
    });
  });

  it("keyboard shortcuts operate on the whole doc", () => {
    addAltStyleElement(startingPoint); // add an element with an inner editor

    typeIntoElementField("title", "1") // type outside the inner editor
      .then(() => typeIntoElementField("content", "2")) // type into the inner editor
      .then(() => typeIntoElementField("title", "3")) // type outside the inner editor
      .then(() => typeIntoElementField("content", "4")) // type into the inner editor
      .then(() => typeIntoElementField("title", "5")) // type outside the inner editor
      .then(() => typeIntoElementField("content", "6")); // type into the inner editor

    getElementRichTextField("title").should("have.text", "135");
    getElementRichTextField("content").should("have.text", "246");

    typeIntoElementField("content", "{meta}Z"); // perform undo from inner editor
    getElementRichTextField("title").should("have.text", "135");
    getElementRichTextField("content").should("have.text", "24");

    typeIntoElementField("content", "{meta}Z"); // perform undo from inner editor
    getElementRichTextField("title").should("have.text", "13");
    getElementRichTextField("content").should("have.text", "24");

    typeIntoElementField("content", "{meta}Z"); // perform undo from inner editor
    getElementRichTextField("title").should("have.text", "13");
    getElementRichTextField("content").should("have.text", "2");

    typeIntoElementField("content", "{meta}{shift}Z"); // perform redo from inner editor
    getElementRichTextField("title").should("have.text", "13");
    getElementRichTextField("content").should("have.text", "24");

    typeIntoElementField("content", "{meta}{shift}Z"); // perform redo from inner editor
    getElementRichTextField("title").should("have.text", "135");
    getElementRichTextField("content").should("have.text", "24");

    typeIntoElementField("content", "{meta}{shift}Z"); // perform redo from inner editor
    getElementRichTextField("title").should("have.text", "135");
    getElementRichTextField("content").should("have.text", "246");
  });

  it("pressing Enter should continue to produce line breaks correctly", () => {
    addAltStyleElement(startingPoint); // add an element with an inner editor

    typeIntoElementField("content", "1")
      .type("{enter}")
      .type("2")
      .type("{enter}")
      .type("3");

    getElementRichTextField("content")
      .find("p")
      .each((p, i) => {
        expect(p.text()).to.equal(String(i + 1));
      });
  });
});
