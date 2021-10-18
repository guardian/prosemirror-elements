export const unescapeHtml = (html: string): string => {
  return (
    new DOMParser().parseFromString(html, "text/html").documentElement
      .textContent ?? ""
  );
};

export const parseHtml = (html: string) => {
  const unescapedHtml = unescapeHtml(html);
  const document = new DOMParser().parseFromString(unescapedHtml, "text/html");
  return document.body.firstElementChild;
};

export const getEmbedSource = (element: Element | null) => {
  // iframe embeds
  const iframeSrc = element?.getAttribute("src");
  if (iframeSrc) return iframeSrc;

  // Twitter embeds
  if (element?.classList.contains("twitter-tweet")) {
    const links = element.querySelectorAll("a");
    return links[links.length - 1].href;
  }

  return "";
};
