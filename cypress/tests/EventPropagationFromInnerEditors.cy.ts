import type { WindowType } from "../../demo/types";
import {
  addAltStyleElement,
  getElementRichTextField,
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

  it("single clicks", () => {
    addAltStyleElement(startingPoint); // add an element with an inner editor

    getElementRichTextField("content").click();

    cy.window().then((win: WindowType) => {
      // @ts-expect-error - just using for testing so don't want to add to the window type
      expect(win.viewPassedToPlugin).to.equal(win.PM_ELEMENTS.view);
    });
  });
});
