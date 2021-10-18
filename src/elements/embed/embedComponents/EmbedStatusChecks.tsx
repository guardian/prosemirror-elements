import { SvgAlertTriangle, SvgTickRound } from "@guardian/src-icons";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import {
  message,
  naughtyColours,
  niceColours,
  warningColours,
} from "./embedStyles";
import { unescapeHtml } from "./embedUtils";

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
