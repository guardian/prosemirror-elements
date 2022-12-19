// This has been taken from the Guardian Source design system:
// https://github.com/guardian/csnx/blob/63a2a71585cf4f98b1d84e3a40aa1e8fa19f70c4/libs/%40guardian/source-react-components/vendor/icons/SvgCrossRound.tsx
// Not available on our current version of Source, but can be pulled in when we upgrade.
import { iconSize } from "@guardian/src-foundations/size";
import type { FunctionComponent } from "react";
import React from "react";

export const SvgCrossRound: FunctionComponent = () => (
  <svg
    width={iconSize["small"]}
    viewBox="-3 -3 30 30"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm5.138-14.358-.782-.78-4.349 3.982-4.364-3.967-.782.78L10.85 12l-3.988 4.342.782.781 4.364-3.967 4.35 3.982.781-.78L13.165 12l3.973-4.358Z"
    />
  </svg>
);
