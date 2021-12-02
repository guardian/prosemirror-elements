import { css } from "@emotion/react";
import { brand, neutral } from "@guardian/src-foundations";
import { SvgInfo } from "@guardian/src-icons";
import React, { useEffect, useState } from "react";
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

const fadeDuration = 300; //Milliseconds

const timeouts: number[] = [];

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
  z-index: 10; // ProseMirror-menubar has a default z-index of 10
  p {
    margin: 10px;
  }
  a {
    color: ${brand[800]};
  }
  opacity: 0;
  transition: opacity ${fadeDuration}ms;
  visibility: hidden;

  &[data-show] {
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
  const [visible, setVisible] = useState(false);
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

  const makeOpaque = () => {
    setOpaque(true);
    setVisible(true);
    timeouts.forEach((timeout) => clearTimeout(timeout));
  };

  const handleMouseEnter = () => {
    makeOpaque();
    if (update) void update();
  };

  const handleMouseLeave = () => {
    setOpaque(false);
    if (update) void update();
  };

  useEffect(() => {
    if (!opaque) {
      const timeout = setTimeout(() => {
        setVisible(false);
      }, fadeDuration);
      timeouts.push(timeout);
    }
  }, [opaque]);

  return (
    <>
      <div
        css={infoIcon}
        ref={setReferenceElement}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SvgInfo />
      </div>

      <div
        ref={setPopperElement}
        style={styles.popper}
        css={tooltip}
        data-show={visible || null}
        data-opaque={opaque || null}
        {...attributes.popper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <div
          ref={setArrowElement}
          style={styles.arrow}
          css={arrow}
          data-show={visible || null}
        />
      </div>
    </>
  );
};
