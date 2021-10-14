import { css, ThemeProvider } from "@emotion/react";
import { buttonBrandAlt } from "@guardian/src-button";
import { border, space } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import { SvgAlertTriangle, SvgTickRound } from "@guardian/src-icons";
import debounce from "lodash/debounce";
import type { ReactChild } from "react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../editorial-source-components/Button";
import { Label } from "../../editorial-source-components/Label";

export type EmbedStatus = {
  tracking: {
    tracks: string;
  };
  reach: {
    unsupportedPlatforms: string[];
  };
};

type StatusProps = {
  embedStatus: EmbedStatus;
};

type PlatformProps = {
  embedStatus: EmbedStatus;
  isMandatory: boolean;
};

const message = css`
  ${textSans.small({ fontWeight: "bold", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
  font-weight: 300;
  margin-bottom: 0px !important;
  margin-top: 0px;
  svg {
    height: 1.2rem;
    width: 1.2rem;
    margin-bottom: -${space[1]}px;
  }
`;

const niceColours = css`
  color: ${border.success};
  svg {
    fill: ${border.success};
  }
`;

const warningColours = css`
  color: #ca870c;
  svg {
    fill: #ca870c;
  }
`;

const naughtyColours = css`
  color: ${border.error};
  svg {
    fill: ${border.error};
  }
`;

const conversionMessage = css`
  background-color: #f7ebd4;
  border: 1px solid #f0d8a8;
  padding: ${space[1]}px;
`;

const iframe = css`
  background-color: white;
  width: 100%;
`;

const unescapeHtml = (html: string): string => {
  return (
    new DOMParser().parseFromString(html, "text/html").documentElement
      .textContent ?? ""
  );
};

const parseHtml = (html: string) => {
  const unescapedHtml = unescapeHtml(html);
  const document = new DOMParser().parseFromString(unescapedHtml, "text/html");
  return document.body.firstElementChild;
};

export const IFrame = ({ children }: { children: ReactChild }) => {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const mountNode = contentRef?.contentWindow?.document.body;

  // Set some default styles for the iframe body
  if (mountNode) {
    mountNode.setAttribute(
      "style",
      "font-family: Helvetica, Arial, sans-serif; font-size: 15px;"
    );
  }

  return (
    <iframe ref={setContentRef} css={iframe}>
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};

const TrackingChecker = (props: StatusProps) => {
  const centralProduction = "mailto:central.production@guardian.co.uk";
  return props.embedStatus.tracking.tracks === "does-not-track" ? (
    <p css={[message, niceColours]}>
      <SvgTickRound />
      This element does not track readers, and will be visible by default.
    </p>
  ) : (
    <p css={[message, naughtyColours]}>
      <SvgAlertTriangle />
      This element tracks readers, so it may not be visible by default in
      future.
      <br />
      Worried? Email{" "}
      <a target="_blank" href={centralProduction}>
        Central Production
      </a>
      .
    </p>
  );
};

const UnsupportedPlatforms = (props: PlatformProps) => {
  const audience = "mailto:audience.global.all@theguardian.com";
  const { embedStatus, isMandatory } = props;
  const unsupportedPlatforms = embedStatus.reach.unsupportedPlatforms;
  if (unsupportedPlatforms.length > 0 && isMandatory) {
    return (
      <p css={[message, warningColours]}>
        <SvgAlertTriangle />
        This element will not be available on all platforms.
        <br />
        Making it required will mean this article won't be published to:
        <span> {unsupportedPlatforms.join(", ")}</span>
        <br />
        Please contact the <a href={audience}>Audience Team</a> for more
        information.
      </p>
    );
  }
  return null;
};

export const EmbedStatusChecks = ({
  html,
  isMandatory,
  checkEmbedTracking,
}: {
  html: string;
  isMandatory: boolean;
  checkEmbedTracking: (html: string) => Promise<EmbedStatus>;
}) => {
  const [embedStatus, updateEmbedStatus] = useState<EmbedStatus>();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- not useful to save value here
    checkTracking(html);
  }, [html]);

  useEffect(() => {
    checkEmbedTracking(unescapeHtml(html))
      .then((response) => {
        updateEmbedStatus(response);
      })
      .catch((e) => console.log(e));
  }, []);

  const checkTracking = useCallback(
    debounce(
      (html) =>
        checkEmbedTracking(unescapeHtml(html))
          .then((response) => {
            updateEmbedStatus(response);
          })
          .catch((e) => console.log(e)),
      3000
    ),
    []
  );

  if (embedStatus != undefined) {
    return (
      <>
        <TrackingChecker embedStatus={embedStatus} />
        <UnsupportedPlatforms
          embedStatus={embedStatus}
          isMandatory={isMandatory}
        />
      </>
    );
  } else return null;
};

const getEmbedSource = (element: Element | null) => {
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

export const ElementRecommendation = ({
  html,
  convertYouTube,
  convertTwitter,
}: {
  html: string;
  convertYouTube: (src: string) => void;
  convertTwitter: (src: string) => void;
}) => {
  const [source, setSource] = useState(getEmbedSource(parseHtml(html)));

  useEffect(() => {
    updateSource(html);
  }, [html]);

  const updateSource = useCallback(
    debounce((html) => setSource(getEmbedSource(parseHtml(html))), 1000),
    []
  );

  return (
    <>
      {source.startsWith("https://twitter.com/") && (
        <div css={[conversionMessage, message]}>
          <span>
            It is recommended to use a Twitter URL rather than pasting their
            embed code.{" "}
          </span>
          <ThemeProvider theme={buttonBrandAlt}>
            <Button priority="secondary" onClick={() => convertTwitter(source)}>
              Convert
            </Button>
          </ThemeProvider>
        </div>
      )}
      {source.includes("https://www.youtube.com/embed/") && (
        <div css={[conversionMessage, message]}>
          <span>
            It is recommended to use a YouTube URL rather than pasting their
            embed code.{" "}
          </span>
          <ThemeProvider theme={buttonBrandAlt}>
            <Button priority="secondary" onClick={() => convertYouTube(source)}>
              Convert
            </Button>
          </ThemeProvider>
        </div>
      )}
      {source.includes("https://www.theguardian.com/email/form/article/") && (
        <>
          <div css={[conversionMessage, message]}>
            <span>
              Please use the new email form to ensure it works for app users.
            </span>
          </div>
        </>
      )}
    </>
  );
};

export const Preview = ({ html }: { html: string }) => {
  const [parsedHtml, setParsedHtml] = useState(unescapeHtml(html));
  useEffect(() => {
    setParsedHtml(unescapeHtml(html));
  }, [html]);
  return (
    <div>
      <Label>Preview</Label>
      <IFrame>
        <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />
      </IFrame>
    </div>
  );
};
