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
