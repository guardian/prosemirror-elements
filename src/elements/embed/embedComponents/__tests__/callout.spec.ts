import { getCalloutTag } from "../../EmbedSpec";

const validCallout =
  '&lt;div data-callout-tagname="ab-new-things-formatting"&gt;&lt;h2&gt;Callout&lt;h2&gt;&lt;p&gt;ab-new-things-formatting&lt;/p&gt;&lt;/div&gt;';

const invalidCallout =
  '&lt;div data-callout-tagname="ab-new-things-formatting&gt;&lt;h2&gt;Callout&lt;h2&gt;&lt;p&gt;ab-new-things-formatting&lt;/p&gt;&lt;/div&gt;';

describe("getCalloutTag", () => {
  it("should extract the tag from valid callout html", () => {
    const tag = getCalloutTag(validCallout);

    expect(tag).toEqual("ab-new-things-formatting");
  });

  it("should return undefined for invalid callout html", () => {
    const tag = getCalloutTag(invalidCallout);

    expect(tag).toEqual(undefined);
  });
});
