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

export type TrackingStatus = {
  tracking: {
    tracks: string;
  };
  reach: {
    unsupportedPlatforms: string[];
  };
};

type StatusProps = {
  trackingStatus: TrackingStatus;
};

type PlatformProps = {
  trackingStatus: TrackingStatus;
  isMandatory: boolean;
};

const elementDoesTrack = (trackingStatus: TrackingStatus): boolean =>
  trackingStatus.tracking.tracks !== "does-not-track";

const TrackingChecker = (props: StatusProps) => {
  const centralProduction = "mailto:central.production@guardian.co.uk";
  return elementDoesTrack(props.trackingStatus) ? (
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

const getUnsupportedPlatforms = (trackingStatus: TrackingStatus): string[] =>
  trackingStatus.reach.unsupportedPlatforms;

const UnsupportedPlatforms = (props: PlatformProps) => {
  const audience = "mailto:audience.global.all@theguardian.com";
  const unsupportedPlatforms = getUnsupportedPlatforms(props.trackingStatus);
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

export const TrackingStatusChecks = ({
  html,
  isMandatory,
  checkThirdPartyTracking,
}: {
  html: string;
  isMandatory: boolean;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
}) => {
  const [trackingStatus, updateTrackingStatus] = useState<TrackingStatus>();

  const checkTrackingAndUpdate = (html: string) => {
    checkThirdPartyTracking(unescapeHtml(html))
      .then((response) => {
        updateTrackingStatus(response);
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

  if (trackingStatus != undefined) {
    return (
      <>
        <TrackingChecker trackingStatus={trackingStatus} />
        <UnsupportedPlatforms
          trackingStatus={trackingStatus}
          isMandatory={isMandatory}
        />
      </>
    );
  } else return null;
};
