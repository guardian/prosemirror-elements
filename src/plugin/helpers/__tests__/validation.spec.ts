import { createDefaultRichTextField } from "../../fieldViews/RichTextFieldView";
import {
  createValidator,
  maxLength,
  required,
  validateWithFieldAndElementValidators,
} from "../validation";

describe("Validation helpers", () => {
  describe("createValidator", () => {
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
        field2: [
          {
            error: "Too long: 7/5",
            message: "field2 is too long: 7/5",
            level: "ERROR",
          },
        ],
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
        field1: [
          { error: "Required", message: "field1 is required", level: "ERROR" },
        ],
      });
    });

    it("should receive a validation map, and return the results of validators for partial data", () => {
      const validator = createValidator({
        field1: [maxLength(5)],
        field2: [required()],
      });
      const result = validator({
        field1: "OK!",
      });

      expect(result).toEqual({
        field1: [],
        field2: [
          { error: "Required", message: "field2 is required", level: "ERROR" },
        ],
      });
    });

    it("should receive a validation map, and return the results of validators where the field is an empty array", () => {
      const validator = createValidator({
        field1: [required()],
      });
      const result = validator({
        field1: [],
      });

      expect(result).toEqual({
        field1: [
          { error: "Required", message: "field1 is required", level: "ERROR" },
        ],
      });
    });
  });

  describe("validateWithFieldAndElementValidators", () => {
    it("should be able to validate with an element validator", () => {
      const fieldDescriptions = {
        field1: createDefaultRichTextField(),
        field2: createDefaultRichTextField(),
      };

      const elementValidator = createValidator({
        field1: [maxLength(5)],
        field2: [maxLength(5)],
      });

      const validator = validateWithFieldAndElementValidators(
        fieldDescriptions,
        elementValidator
      );

      const result = validator({
        field1: "OK!",
        field2: "Not OK!",
      });

      expect(result).toEqual({
        field1: [],
        field2: [
          {
            error: "Too long: 7/5",
            message: "field2 is too long: 7/5",
            level: "ERROR",
          },
        ],
      });
    });
    it("should be able to validate with a field validators", () => {
      const fieldDescriptions = {
        field1: createDefaultRichTextField([maxLength(5)]),
        field2: createDefaultRichTextField([maxLength(5)]),
      };

      const validator = validateWithFieldAndElementValidators(
        fieldDescriptions
      );

      const result = validator({
        field1: "OK!",
        field2: "Not OK!",
      });

      expect(result).toEqual({
        field1: [],
        field2: [
          {
            error: "Too long: 7/5",
            message: "field2 is too long: 7/5",
            level: "ERROR",
          },
        ],
      });
    });
    it("should be able to validate with a mix of validators", () => {
      const fieldDescriptions = {
        field1: createDefaultRichTextField([maxLength(5)]),
        field2: createDefaultRichTextField(),
      };

      const elementValidator = createValidator({
        field2: [maxLength(5)],
      });

      const validator = validateWithFieldAndElementValidators(
        fieldDescriptions,
        elementValidator
      );

      const result = validator({
        field1: "Not OK!",
        field2: "Not OK!",
      });

      expect(result).toEqual({
        field1: [
          {
            error: "Too long: 7/5",
            message: "field1 is too long: 7/5",
            level: "ERROR",
          },
        ],
        field2: [
          {
            error: "Too long: 7/5",
            message: "field2 is too long: 7/5",
            level: "ERROR",
          },
        ],
      });
    });
  });
});
