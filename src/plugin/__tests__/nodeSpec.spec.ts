import { createRepeaterField } from "../fieldViews/RepeaterFieldView";
import { createTextField } from "../fieldViews/TextFieldView";
import { getNodeSpecForField } from "../nodeSpec";

describe("NodeSpec generation", () => {
  describe("Repeater fields", () => {
    it("should create a NodeSpec for the repeater field node that permits the nested content, and a NodeSpec for the nested field", () => {
      const nodeSpec = getNodeSpecForField(
        "exampleElement",
        "exampleRepeater",
        createRepeaterField({
          exampleField: createTextField(),
        })
      );

      expect(nodeSpec["exampleElement__exampleRepeater"]).toMatchObject({
        content: "exampleElement__exampleField",
      });
      expect(nodeSpec["exampleElement__exampleField"]).toBeTruthy();
    });

    it("should handle nested repeater fields", () => {
      const nodeSpec = getNodeSpecForField(
        "exampleElement",
        "exampleRepeater",
        createRepeaterField({
          nestedRepeaterField: createRepeaterField({
            exampleField: createTextField(),
          }),
        })
      );

      expect(nodeSpec["exampleElement__exampleRepeater"]).toMatchObject({
        content: "exampleElement__nestedRepeaterField",
      });
      expect(nodeSpec["exampleElement__nestedRepeaterField"]).toMatchObject({
        content: "exampleElement__exampleField",
      });
      expect(nodeSpec["exampleElement__exampleField"]).toBeTruthy();
    });
  });
});
