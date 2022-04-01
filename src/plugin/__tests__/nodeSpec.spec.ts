import { createRepeaterField } from "../fieldViews/RepeaterFieldView";
import { createTextField } from "../fieldViews/TextFieldView";
import { getNodeSpecForField } from "../nodeSpec";

describe("NodeSpec generation", () => {
  describe("Repeater fields", () => {
    it("should create a NodeSpec for the repeater field node", () => {
      const nodeSpec = getNodeSpecForField(
        "example-element",
        "example-repeater",
        createRepeaterField({
          exampleField: createTextField(),
        })
      );

      expect(nodeSpec).toBe({});
    });

    it("should create a NodeSpec for each child field of the repeater field node", () => {});
  });
});
