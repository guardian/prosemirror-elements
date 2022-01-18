import {
  parseHtml,
  unescapeHtml,
} from "../../embed/embedComponents/embedUtils";

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
