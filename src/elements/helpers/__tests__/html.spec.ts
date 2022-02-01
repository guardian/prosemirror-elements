import { htmlContainsSingleIframe, parseHtml, unescapeHtml } from "../html";

describe("unescapeHtml", () => {
  it("should unescape HTML", () => {
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

describe("htmlContainsSingleIframe", () => {
  it("should return true for a single iframe", () => {
    const iframeHtml = "<iframe srcdoc='<div>Hello world</div>'></iframe>";

    const containsSingleIframe = htmlContainsSingleIframe(iframeHtml);

    expect(containsSingleIframe).toEqual(true);
  });
  it("should return false for a single iframe alongside another element", () => {
    const iframeHtml =
      "<iframe srcdoc='<div>Hello world</div>'></iframe><p>Not an iframe<p>";

    const containsSingleIframe = htmlContainsSingleIframe(iframeHtml);

    expect(containsSingleIframe).toEqual(false);
  });
  it("should return false for a single non-iframe element", () => {
    const iframeHtml = "<p>Not an iframe<p>";

    const containsSingleIframe = htmlContainsSingleIframe(iframeHtml);

    expect(containsSingleIframe).toEqual(false);
  });
});
