import { css } from "@emotion/react";
import { border } from "@guardian/src-foundations";
import { textSans } from "@guardian/src-foundations/typography";
import { SvgAlertTriangle, SvgTickRound } from "@guardian/src-icons";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";

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
  margin-bottom: 0px;
  svg {
    height: 1.2rem;
    width: 1.2rem;
    margin-bottom: -4px;
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

const centralProduction = "mailto:central.production@guardian.co.uk";

const TrackingChecker = (props: StatusProps) =>
  props.embedStatus.tracking.tracks === "does-not-track" ? (
    <p css={[message, niceColours]}>
      <SvgTickRound />
      This embed does not track readers, and will be visible by default.
    </p>
  ) : (
    <p css={[message, naughtyColours]}>
      <SvgAlertTriangle />
      This embed tracks readers, so it may not be visible by default in future.
      <br />
      Worried? Email{" "}
      <a target="_blank" href={centralProduction}>
        Central Production
      </a>
      .
    </p>
  );

const UnsupportedPlatforms = (props: PlatformProps) => {
  const { embedStatus, isMandatory } = props;
  const unsupportedPlatforms = embedStatus.reach.unsupportedPlatforms;
  if (unsupportedPlatforms.length > 0 && isMandatory) {
    return (
      <p css={[message, warningColours]}>
        <SvgAlertTriangle />
        This embed will not be available on all platforms.
        <br />
        Making it required will mean this article won't be published to:
        <span> {unsupportedPlatforms.join(", ")}</span>
        <br />
        Please contact the
        <a href="mailto:audience.global.all@theguardian.com"> Audience Team </a>
        for more information.
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
    checkEmbedTracking(
      new DOMParser().parseFromString(html, "text/html").documentElement
        .textContent ?? ""
    )
      .then((response) => {
        updateEmbedStatus(response);
      })
      .catch((e) => console.log(e));
  }, []);

  const checkTracking = useCallback(
    debounce(
      (html) =>
        checkEmbedTracking(
          new DOMParser().parseFromString(html, "text/html").documentElement
            .textContent ?? ""
        )
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
