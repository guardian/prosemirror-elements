import { css } from "@emotion/react";
import { brand, neutral } from "@guardian/src-foundations";
import { SvgInfo } from "@guardian/src-icons";
import React, { useState } from "react";
import { usePopper } from "react-popper";

const infoIcon = css`
  height: 22px;
  width: 22px;
  margin-right: 4px;
  margin-left: -4px;
  svg {
    margin: -1px;
  }
  :hover {
    cursor: pointer;
  }
`;

const tooltip = css`
  font-family: "Guardian Agate Sans";
  background-color: ${neutral[10]};
  color: ${neutral[97]};
  width: 300px;
  font-weight: 300;
  border-radius: 4px;
  line-height: 1.2rem;
  font-family: "Guardian Agate Sans";
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 30%));
  z-index: 1;
  p {
    margin: 10px;
  }
  a {
    color: ${brand[800]};
  }
  opacity: 0;
  transition: opacity 0.3s;
  /* transition: visibility 0.3s; */
  transition: visibility 0s;
  transition-delay: visibility 0s;

  visibility: hidden;
  &[data-show] {
    transition-delay: visibility 1s;
    transition-delay: transition-delay 1s;
    visibility: visible;
  }
  &[data-opaque] {
    opacity: 1;
  }
  [data-popper-reference-hidden] {
    visibility: hidden;
    pointer-events: none;
  }
`;

const arrow = css`
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  visibility: hidden;
  &[data-show] {
    ::before {
      visibility: visible;
    }
  }
  &[data-opaque] {
    ::before {
      opacity: 1;
    }
  }
  &[data-popper-reference-hidden] {
    ::before {
      visibility: hidden;
      pointer-events: none;
    }
  }
  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
    content: "";
    transform: translate(0px, -4px) rotate(45deg);
  }
`;

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [timeoutIsValid, setTimeoutIsValid] = useState(false);
  const [opaque, setOpaque] = useState(false);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes, update } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: "top",
      modifiers: [
        { name: "arrow", options: { element: arrowElement } },
        {
          name: "offset",
          options: {
            offset: [0, 4],
          },
        },
      ],
    }
  );
  return (
    <>
      <div
        css={infoIcon}
        ref={setReferenceElement}
        onMouseEnter={() => {
          setTimeoutIsValid(false);
          setOpaque(true);
          setTooltipVisible(true);
          if (update) void update();
        }}
        onMouseLeave={() => {
          setTimeoutIsValid(true);
          setOpaque(false);
          setTimeout(() => {
            if (timeoutIsValid) {
              setTooltipVisible(false);
            }
          }, 2000);
          if (update) void update();
        }}
      >
        <SvgInfo />
      </div>

      <div
        ref={setPopperElement}
        style={styles.popper}
        css={tooltip}
        data-show={tooltipVisible ? tooltipVisible : null}
        data-opaque={opaque ? opaque : null}
        {...attributes.popper}
        onMouseEnter={() => {
          setTooltipVisible(true);
          setOpaque(true);
          setTimeoutIsValid(false);
          if (update) void update();
        }}
        onMouseLeave={() => {
          setTimeoutIsValid(true);
          setOpaque(false);
          setTimeout(() => {
            if (timeoutIsValid) {
              setTooltipVisible(false);
            }
          }, 2000);
          if (update) void update();
        }}
      >
        {children}
        <div
          ref={setArrowElement}
          style={styles.arrow}
          css={arrow}
          data-show={tooltipVisible ? tooltipVisible : null}
        />
      </div>
    </>
  );
};
