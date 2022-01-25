import { css } from "@emotion/react";
import { useRef, useState } from "react";
import { Description } from "../../editorial-source-components/Description";
import type { InputHeadingProps } from "../../editorial-source-components/InputHeading";
import { InputHeading } from "../../editorial-source-components/InputHeading";
import { unescapeHtml } from "./html";

type PreviewProps = Partial<InputHeadingProps> & {
  html?: string;
  iframeUrl?: string;
};

const getDocHeight = (doc: Document | undefined) => {
  if (doc) {
    const body = doc.body;
    const html = doc.documentElement;
    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    return height;
  }
  return undefined;
};

export const Preview = ({
  html,
  iframeUrl,
  headingLabel = "Preview",
  ...rest
}: PreviewProps) => {
  const [height, setHeight] = useState("0px");
  const [resize, setResize] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  const maxHeight = 120; // In px

  const updateIframeHeight = () => {
    const heightOfContent = getDocHeight(ref.current?.contentWindow?.document);
    if (heightOfContent && heightOfContent < maxHeight) {
      setHeight((heightOfContent + 4).toString() + "px");
    } else if (heightOfContent && heightOfContent > maxHeight) {
      setHeight(maxHeight.toString() + "px");
      setResize(true);
    } else setResize(false);
  };

  const onLoad = () => {
    updateIframeHeight();
    setTimeout(() => {
      updateIframeHeight();
    }, 1000);
  };

  const iframe = css`
    resize: ${resize || iframeUrl ? "vertical" : "none"};
    background-color: white;
    width: 100%;
    font-family: sans-serif;
  `;

  let preview = null;

  if (iframeUrl) {
    preview = <iframe src={iframeUrl} css={iframe} />;
  } else if (html) {
    preview = (
      <iframe
        srcDoc={unescapeHtml(html)}
        css={iframe}
        height={height}
        ref={ref}
        onLoad={onLoad}
        id="myFrame"
      />
    );
  } else {
    preview = <Description>No preview available.</Description>;
  }

  return (
    <div>
      <InputHeading headingLabel={headingLabel} {...rest} />
      {preview}
    </div>
  );
};
