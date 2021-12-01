import { getEmbedSource, parseHtml, unescapeHtml } from "../embedUtils";

describe("getEmbedSource", () => {
  it("should return the `src` attribute for an iframe", () => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", "https://www.example.com");

    const iframeSrc = getEmbedSource(iframe);

    expect(iframeSrc).toEqual("https://www.example.com");
  });

  it("should return the final `href` attribute for a tweet embed", () => {
    const exampleTweet =
      '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Times change but Guardian values don’t: 200 years, and we’ve only just begun | Katharine Viner <a href="https://t.co/LuvhzFRjLl">https://t.co/LuvhzFRjLl</a> <a href="https://t.co/x9xMmmddeF">pic.twitter.com/x9xMmmddeF</a></p>&mdash; The Guardian (@guardian) <a href="https://twitter.com/guardian/status/1389937492065931266?ref_src=twsrc%5Etfw">May 5, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
    const parsedTweet = new DOMParser().parseFromString(
      exampleTweet,
      "text/html"
    );
    const tweetElement = parsedTweet.body.firstElementChild;

    const tweetSrc = getEmbedSource(tweetElement);

    expect(tweetSrc).toEqual(
      "https://twitter.com/guardian/status/1389937492065931266?ref_src=twsrc%5Etfw"
    );
  });

  it("should return an empty string for other valid html", () => {
    const genericHtml = '<a href="https://www.example.com">Example website</a>';
    const parsedHtml = new DOMParser().parseFromString(
      genericHtml,
      "text/html"
    );
    const genericElement = parsedHtml.body.firstElementChild;
    const src = getEmbedSource(genericElement);

    expect(src).toEqual("");
  });

  it("should return an empty string for invalid html", () => {
    const invalidHtml = "<<graun>??--/>";
    const parsedHtml = new DOMParser().parseFromString(
      invalidHtml,
      "text/html"
    );
    const invalidElement = parsedHtml.body.firstElementChild;
    const src = getEmbedSource(invalidElement);

    expect(src).toEqual("");
  });
});

describe("unescapeHtml", () => {
  it("should return an empty string for other valid html", () => {
    const escapedHtml =
      "&lt;a href=&quot;https://www.example.com&quot;&gt;Example website&lt;/a&gt;";

    const unescapedHtml = unescapeHtml(escapedHtml);

    expect(unescapedHtml).toEqual(
      '<a href="https://www.example.com">Example website</a>'
    );
  });
});

describe("parseHtml", () => {
  it("should return an object", () => {
    const escapedHtml =
      "&lt;a href=&quot;https://www.example.com&quot;&gt;Example website&lt;/a&gt;";
    const identicalElement = document.createElement("a");
    identicalElement.setAttribute("href", "https://www.example.com");
    identicalElement.appendChild(document.createTextNode("Example website"));

    const parsedHtml = parseHtml(escapedHtml);

    expect(parsedHtml).toEqual(identicalElement);
  });
});
