import { htmlContainsSingleIframe, parseHtml } from "../html";

describe("parseHtml", () => {
  it("should return an object", () => {
    const escapedHtml = `<a href="https://www.example.com">Example website</a>`;
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
