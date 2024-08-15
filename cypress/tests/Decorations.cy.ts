import {
  addNestedElement,
  addRepeaterElement,
  getElementRichTextField,
  visitRoot,
} from "../helpers/editor";

describe("Decorations", () => {
  beforeEach(visitRoot);

  const assertInlineDecosAreValidForField = (
    fieldName: string,
    decoCount: number
  ) => {
    getElementRichTextField(fieldName)
      .find(".TestDecoration")
      .then((items) => {
        expect(items.length).to.equal(decoCount);
        items.each((_, item) => {
          expect(item).to.contain.text("deco");
        });
      });
  };

  const getTextBetweenNodes = (startNode: Node, endNode: Node): string => {
    let currentNode = startNode.nextSibling;
    let textContent = "";

    while (currentNode && currentNode !== endNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        textContent += currentNode.textContent;
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        textContent += element.innerText || element.textContent;
      }
      currentNode = currentNode.nextSibling;
    }

    return textContent;
  };

  const assertWidgetDecosAreValidForField = (
    fieldName: string,
    decoCount: number
  ) => {
    getElementRichTextField(fieldName)
      .find(".TestWidgetDecoration")
      .then((items) => {
        expect(items.length).to.equal(decoCount);
      })
      .then(() => {
        // Check that the only text between the Widget decorations is 'widget', and that the
        // decorations are therefore positioned correctly in the document
        cy.get(`.TestWidgetDecoration`)
          .then(($nodes) => {
            const firstNode = $nodes[0];
            const lastNode = $nodes[$nodes.length - 1];

            const textBetweenNodes = getTextBetweenNodes(firstNode, lastNode);
            return cy.wrap(textBetweenNodes);
          })
          .then((text) => {
            expect(text).to.equal("widget");
          });
      });
  };

  it("should render inline decorations in repeater fields", () => {
    addRepeaterElement({
      repeater: [
        {
          repeaterText: "Example repeater text 1 deco",
          nestedRepeater: [
            { nestedRepeaterText: "Example nested repeater text 1 deco" },
          ],
        },
        { repeaterText: "Example repeater text 2 deco" },
      ],
    });

    assertInlineDecosAreValidForField("repeaterText", 2);
    assertInlineDecosAreValidForField("nestedRepeaterText", 1);
  });

  it(`should render inline decorations in repeater fields within nested element fields`, () => {
    addNestedElement({
      repeater: [
        {
          title: "A",
          content: [
            {
              assets: [],
              elementType: "pullquote",
              fields: { html: "Example pullquote with deco" },
            },
          ],
        },
        {
          title: "C",
          content: [
            {
              assets: [],
              elementType: "pullquote",
              fields: { html: "Example pullquote with deco" },
            },
          ],
        },
      ],
    });

    assertInlineDecosAreValidForField("content", 2);
  });

  it("should render widget decorations in repeater fields", () => {
    addRepeaterElement({
      repeater: [
        {
          repeaterText: "Example repeater text 1 widget",
          nestedRepeater: [
            { nestedRepeaterText: "Example nested repeater text 1 widget" },
          ],
        },
        { repeaterText: "Example repeater text 2 widget" },
      ],
    });

    assertWidgetDecosAreValidForField("repeaterText", 4);
    assertWidgetDecosAreValidForField("nestedRepeaterText", 2);
  });

  it(`should render widget decorations in repeater fields within nested element fields`, () => {
    addNestedElement({
      repeater: [
        {
          title: "A",
          content: [
            {
              assets: [],
              elementType: "pullquote",
              fields: { html: "Example pullquote with widget" },
            },
          ],
        },
        {
          title: "C",
          content: [
            {
              assets: [],
              elementType: "pullquote",
              fields: { html: "Example pullquote with widget" },
            },
          ],
        },
      ],
    });

    assertWidgetDecosAreValidForField("content", 4);
  });
});
