import { flow, omit } from "lodash";
import {
  buildElementPlugin,
  createStandardElement,
  createTweetElement,
  membershipElement,
  richlinkElement,
  tableElement,
} from "../../..";
import { commentElement } from "../../comment/CommentSpec";
import { deprecatedElement } from "../../deprecated/DeprecatedSpec";
import { createTestSchema } from "../test";
import { transformElementIn, transformElementOut } from "../transform";
import { allElementFixtures } from "./fixtures";

describe("Element fixtures", () => {
  /**
   * This spec runs every fixture declared in `./fixtures/index.ts` through
   * prosemirror-elements' node representation, and out again. It's useful for
   * spotting any discrepencies that we might inadvertently introduce as we use
   * prosemirror-elements for more elements in our CMS.
   *
   * To add a new fixture, add the fixture JSON to `./fixtures/index.ts`, and
   * add the relevant element to the `elements` object below, to ensure the
   * prosemirror-elements plugin recognises the new element type.
   */
  const standardElement = createStandardElement({
    checkThirdPartyTracking: Promise.resolve,
  });
  const elements = {
    "rich-link": richlinkElement,
    membership: membershipElement,
    audio: standardElement,
    map: standardElement,
    document: standardElement,
    table: tableElement,
    witness: deprecatedElement,
    vine: deprecatedElement,
    instagram: deprecatedElement,
    tweet: createTweetElement({
      checkThirdPartyTracking: Promise.resolve,
      createCaptionPlugins: undefined,
    }),
    comment: commentElement,
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
  allElementFixtures.forEach(({ name, fixtures, defaults }) => {
    describe(`round-tripping data for the ${name} element fixtures in and out of prosemirror-elements' node representation`, () => {
      it("should not change element data, unless we are knowingly supplying new defaults", () => {
        const roundTripElementData = createRoundTripElementData(
          name as keyof typeof elements
        );
        fixtures.forEach(({ element }) => {
          const roundTrippedElementData = roundTripElementData(element);

          /**
           * We expect certain differences in our elements, as both role and isMandatory
           * properties may historically be absent but will now be added as default.
           * If our element data does not have these properties, we ignore them in the new
           * element data.
           */
          const ignoredFieldValues = [];

          if (!element.fields.isMandatory) {
            ignoredFieldValues.push("fields.isMandatory");
          }

          const elementToCompare = omit(
            { ...element, fields: { ...(defaults ?? {}), ...element.fields } },
            "elementType",
            ...ignoredFieldValues
          );
          const roundTrippedElementToCompare = omit(
            roundTrippedElementData,
            ...ignoredFieldValues
          );

          expect(roundTrippedElementToCompare).toEqual(elementToCompare);
        });
      });
    });
  });
});
