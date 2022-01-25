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
  const ref = useRef<HTMLIFrameElement>(null);

  const updateIframeHeight = () => {
    const heightOfContent = getDocHeight(ref.current?.contentWindow?.document);
    if (heightOfContent) {
      setHeight((heightOfContent + 4).toString() + "px");
    }
  };

  const onLoad = () => {
    updateIframeHeight();
    setTimeout(() => {
      updateIframeHeight();
    }, 1000);
  };

  const iframe = css`
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
