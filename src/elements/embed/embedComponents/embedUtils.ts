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

export type TwitterUrl = `https://twitter.com/${string}`;
export type YoutubeUrl = `${string}https://www.youtube.com/embed/${string}`;

export const isTwitterUrl = (url: string): url is TwitterUrl =>
  url.startsWith("https://twitter.com/");
export const isYoutubeUrl = (url: string): url is YoutubeUrl =>
  url.includes("https://www.youtube.com/embed/");
