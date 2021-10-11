import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { background, border } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";

export const labelStyles = css`
  ${textSans.small({ fontWeight: "bold", lineHeight: "loose" })}
  font-family: "Guardian Agate Sans";
  display: block;
`;

type EmbedStatus = {
  reach: string[];
  tracking: {
    tracks: string;
  };
};

export const TrackingChecker = ({
  html,
  checkEmbedTracking,
}: {
  html: string;
  checkEmbedTracking: (html: string) => Promise<any>;
}) => {
  const [trackingState, updateTrackingState] = useState<
    undefined | EmbedStatus
  >();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- not useful to save value here
    checkTracking(html);
  }, [html]);

  const checkTracking = useCallback(
    debounce(
      (html) =>
        checkEmbedTracking(
          new DOMParser().parseFromString(html, "text/html").documentElement
            .textContent ?? ""
        )
          .then((response) => {
            updateTrackingState(response);
          })
          .catch((e) => console.log(e)),
      3000
    ),
    []
  );

  if (trackingState != undefined) {
    return trackingState.tracking.tracks === "does-not-track" ? (
      <div>Does not track</div>
    ) : (
      <div>Tracks</div>
    );
  } else return <div />;
};
