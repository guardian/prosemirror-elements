import { flow, omit } from "lodash";
import { buildElementPlugin, richlinkElement } from "../../..";
import { createTestSchema } from "../test";
import { transformElementIn, transformElementOut } from "../transform";
import { allElementFixtures } from "./fixtures";

describe("Element fixtures", () => {
  const elements = {
    "rich-link": richlinkElement,
  } as const;

  const {
    getElementDataFromNode,
    getNodeFromElementData,
    nodeSpec,
  } = buildElementPlugin(elements);

  const { schema, serializer } = createTestSchema(nodeSpec);

  /**
   * Creates a function that passes element data through our data
   * transformers, into a Prosemirror node, and then back out through the
   * transformers again.
   *
   * This reflects what happens when an element is parsed into a document in
   * Composer, and then parsed back out to be saved.
   */
  const createRoundTripElementData = (elementName: keyof typeof elements) =>
    flow(
      (flexElement) => transformElementIn(elementName, flexElement),
      (values) => getNodeFromElementData({ elementName, values }, schema),
      (node) => node && getElementDataFromNode(node, serializer),
      (maybePMEElement) =>
        maybePMEElement &&
        transformElementOut(maybePMEElement.elementName, maybePMEElement.values)
    );

  // Run fixtures for each element specified in `./fixtures/index.ts` through our round-trip tests.
  Object.entries(allElementFixtures).forEach(
    ([elementName, elementFixtures]) => {
      describe(`round-tripping data for the ${elementName} element fixtures in and out of prosemirror-elements' node representation`, () => {
        it("should not change element data, unless we are knowingly supplying new defaults", () => {
          const roundTripElementData = createRoundTripElementData(
            elementName as keyof typeof elements
          );
          elementFixtures.forEach(({ elements: elementJson }) => {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- we're asserting this data at runtime in the test */
            const elementData = JSON.parse(elementJson);
            const roundTrippedElementData = roundTripElementData(elementData);

            /**
             * We expect certain differences in our elements, as both role and isMandatory
             * properties may historically be absent but will now be added as default.
             * If our element data does not have these properties, we ignore them in the new
             * element data.
             */
            const ignoredFieldValues = [];
            if (!elementData.fields.isMandatory) {
              ignoredFieldValues.push("fields.isMandatory");
            }
            if (!elementData.fields.role) {
              ignoredFieldValues.push("fields.role");
            }
            const elementToCompare = omit(
              elementData,
              "elementType",
              ...ignoredFieldValues
            );
            const roundTrippedElementToCompare = omit(
              roundTrippedElementData,
              ...ignoredFieldValues
            );

            expect(roundTrippedElementToCompare).toEqual(elementToCompare);
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
          });
        });
      });
    }
  );
});
