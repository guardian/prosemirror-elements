import { ImageElementTestId } from "../../src/elements/demo-image/DemoImageElementForm";
import {
  moveBottomTestId,
  moveDownTestId,
  moveTopTestId,
  moveUpTestId,
  removeTestId,
  selectTestId,
} from "../../src/renderers/react/WrapperControls";
import {
  addImageElement,
  assertEditorFocus,
  getArrayOfBlockElementTypes,
  selectDataCy,
  visitRoot,
} from "../helpers/editor";

describe("ElementWrapper", () => {
  beforeEach(visitRoot);

  describe("Element creation", () => {
    it("should create an element given its DOM specification", () => {
      addImageElement();
      cy.get(selectDataCy(ImageElementTestId));
    });
  });

  describe("Element movement", () => {
    const getButtons = () => {
      const bottomBtn = cy.get(selectDataCy(moveBottomTestId));
      const downBtn = cy.get(selectDataCy(moveDownTestId));
      const topBtn = cy.get(selectDataCy(moveTopTestId));
      const upBtn = cy.get(selectDataCy(moveUpTestId));

      return {
        bottomBtn,
        downBtn,
        topBtn,
        upBtn,
      };
    };

    const assertButtonStates = (
      expectedBtnStates: Record<keyof ReturnType<typeof getButtons>, boolean>
    ) => {
      // This is how the docs describe waiting for promises:
      // https://docs.cypress.io/api/utilities/promise#Waiting-for-Promises
      // Removing this causes the test to fail in headless mode at the
      // time of writing
      cy.wrap(null).then(() => {
        const btns = getButtons();
        const btnStates: Record<string, boolean> = {};

        return Cypress.Promise.all(
          Object.entries(btns).map(
            ([name, btnEl]: [string, Cypress.Chainable<JQuery>]) => {
              return new Cypress.Promise<void>((resolve) => {
                btnEl.then((el) => {
                  btnStates[name] = el.prop("disabled") as boolean;
                  resolve();
                });
              });
            }
          )
        ).then(() => {
          expect(expectedBtnStates).to.deep.equal(btnStates);
        });
      });
    };

    it("should move an element from the top downwards", async () => {
      addImageElement();
      const { downBtn } = getButtons();
      downBtn.click();

      const elementTypes = await getArrayOfBlockElementTypes();

      expect(elementTypes).to.deep.equal(["paragraph", "element", "paragraph"]);

      assertButtonStates({
        topBtn: false,
        upBtn: false,
        downBtn: false,
        bottomBtn: false,
      });
    });

    it("should move an element from the bottom upwards", async () => {
      addImageElement();
      const { bottomBtn, upBtn } = getButtons();
      bottomBtn.click();
      upBtn.click();

      const elementTypes = await getArrayOfBlockElementTypes();

      expect(elementTypes).to.deep.equal(["paragraph", "element", "paragraph"]);

      assertButtonStates({
        topBtn: false,
        upBtn: false,
        downBtn: false,
        bottomBtn: false,
      });
    });

    it("should move an element to the bottom", async () => {
      addImageElement();
      const { bottomBtn } = getButtons();
      bottomBtn.click();

      const elementTypes = await getArrayOfBlockElementTypes();

      expect(elementTypes).to.deep.equal(["paragraph", "paragraph", "element"]);

      assertButtonStates({
        topBtn: false,
        upBtn: false,
        downBtn: true,
        bottomBtn: true,
      });
    });

    it("should move an element up", async () => {
      addImageElement();
      const { bottomBtn, upBtn } = getButtons();
      bottomBtn.click();
      upBtn.click();

      const elementTypes = await getArrayOfBlockElementTypes();

      expect(elementTypes).to.deep.equal(["paragraph", "element", "paragraph"]);

      assertButtonStates({
        topBtn: false,
        upBtn: false,
        downBtn: false,
        bottomBtn: false,
      });
    });

    it("should move an element to the top", async () => {
      addImageElement();
      const { bottomBtn, upBtn } = getButtons();
      bottomBtn.click();
      upBtn.click();
      cy.get(selectDataCy(moveTopTestId)).click();

      const elementTypes = await getArrayOfBlockElementTypes();

      expect(elementTypes).to.deep.equal(["element", "paragraph", "paragraph"]);

      assertButtonStates({
        topBtn: true,
        upBtn: true,
        downBtn: false,
        bottomBtn: false,
      });
    });

    it("should remove an element", async () => {
      addImageElement();
      cy.get(selectDataCy(removeTestId)).click();
      cy.get(selectDataCy(removeTestId)).click();
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "paragraph"]);
    });

    it("should focus the editor after element removal", () => {
      addImageElement();
      cy.get(selectDataCy(removeTestId)).click();
      cy.get(selectDataCy(removeTestId)).click();
      assertEditorFocus(true);
    });
  });

  describe("Element selection", () => {
    it("should delete the element after selecting and typing", async () => {
      addImageElement();
      cy.wait(100).get(selectDataCy(selectTestId)).click().type(`text`);
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal([
        "paragraph",
        "paragraph",
        "paragraph",
      ]);
    });

    it("should delete the element after selecting and using backsapce", async () => {
      addImageElement();
      cy.wait(100).get(selectDataCy(selectTestId)).click().type(`{del}`);
      const elementTypes = await getArrayOfBlockElementTypes();
      expect(elementTypes).to.deep.equal(["paragraph", "paragraph"]);
    });
  });
});
