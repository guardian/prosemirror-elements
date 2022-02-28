import { ThemeProvider } from "@emotion/react";
import { buttonBrandAlt } from "@guardian/src-button";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../../../editorial-source-components/Button";
import { parseHtml } from "../../helpers/html";
import { conversionMessage, message } from "../../helpers/messagingStyles";
import type { TwitterUrl, YoutubeUrl } from "./embedUtils";
import { getEmbedSource, isTwitterUrl, isYoutubeUrl } from "./embedUtils";

export const EmbedRecommendation = ({
  html,
  convertYouTube,
  convertTwitter,
}: {
  html: string;
  convertYouTube: (src: YoutubeUrl) => void;
  convertTwitter: (src: TwitterUrl) => void;
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
      {isTwitterUrl(source) && (
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
      {isYoutubeUrl(source) && (
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
