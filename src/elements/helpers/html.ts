export const unescapeHtml = (html: string): string => {
  return (
    new DOMParser().parseFromString(html, "text/html").documentElement
      .textContent ?? ""
  );
};

export const parseHtml = (html: string) => {
  const unescapedHtml = unescapeHtml(html);
  const parsedHtml = new DOMParser().parseFromString(
    unescapedHtml,
    "text/html"
  );
  return parsedHtml.body.firstElementChild;
};

export const isHtmlSafe = (html: string) => {
  const holder = document.createElement("div");
  holder.innerHTML = (html || "").trim();
  const element = holder.children[0];
  const isIframe = element.tagName === "IFRAME";
  const singleChild = !element.nextSibling;
  return isIframe && singleChild;
};
