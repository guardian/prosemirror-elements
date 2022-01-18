import { SvgAlertTriangle, SvgTickRound } from "@guardian/src-icons";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import { unescapeHtml } from "./html";
import {
  message,
  naughtyColours,
  niceColours,
  warningColours,
} from "./messagingStyles";

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

const elementDoesTrack = (embedStatus: EmbedStatus): boolean =>
  embedStatus.tracking.tracks !== "does-not-track";

const TrackingChecker = (props: StatusProps) => {
  const centralProduction = "mailto:central.production@guardian.co.uk";
  return elementDoesTrack(props.embedStatus) ? (
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
  ) : (
    <p css={[message, niceColours]}>
      <SvgTickRound />
      This element does not track readers, and will be visible by default.
    </p>
  );
};

const getUnsupportedPlatforms = (embedStatus: EmbedStatus): string[] =>
  embedStatus.reach.unsupportedPlatforms;

const UnsupportedPlatforms = (props: PlatformProps) => {
  const audience = "mailto:audience.global.all@theguardian.com";
  const unsupportedPlatforms = getUnsupportedPlatforms(props.embedStatus);
  if (unsupportedPlatforms.length > 0 && props.isMandatory) {
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

  const checkTrackingAndUpdate = (html: string) => {
    checkEmbedTracking(unescapeHtml(html))
      .then((response) => {
        updateEmbedStatus(response);
      })
      .catch((e) => console.log(e));
  };

  const checkTrackingAndUpdateDebounced = useCallback(
    debounce(checkTrackingAndUpdate, 3000),
    []
  );

  useEffect(() => {
    checkTrackingAndUpdateDebounced(html);
  }, [html]);

  useEffect(() => {
    checkTrackingAndUpdate(html);
  }, []);

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
