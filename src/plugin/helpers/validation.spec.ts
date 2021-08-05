import { createValidator, maxLength, required } from "./validation";

describe("Validation helpers", () => {
  describe("buildValidator", () => {
    it("should receive a validation map, and return the results of validators", () => {
      const validator = createValidator({
        field1: [maxLength(5)],
        field2: [maxLength(5)],
      });
      const result = validator({
        field1: "OK!",
        field2: "Not OK!",
      });

      expect(result).toEqual({
        field1: [],
        field2: ["Too long: 7/5"],
      });
    });

    it("should receive a validation map, and return the results of multiple validators per field", () => {
      const validator = createValidator({
        field1: [required(), maxLength(5)],
      });

      const result = validator({
        field1: "",
      });

      expect(result).toEqual({
        field1: ["Required"],
      });
    });
  });
});
