import { extractTag } from "../../CalloutForm";

const validCallout =
  '<div data-callout-tagname="ab-new-things-formatting"><h2>Callout<h2><p>ab-new-things-formatting</p></div>';

const invalidCallout =
  '<div data-callout-tagname="ab-new-things-formatting><h2>Callout<h2><p>ab-new-things-formatting</p></div>';

describe("extractTag", () => {
  it("should extract the tag from valid callout html", () => {
    const tag = extractTag(validCallout);

    expect(tag).toEqual("ab-new-things-formatting");
  });

  it("should return undefined for invalid callout html", () => {
    const tag = extractTag(invalidCallout);

    expect(tag).toEqual(undefined);
  });
});
