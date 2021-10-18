import { css } from "@emotion/react";
import type { ReactChild } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Label } from "../../../editorial-source-components/Label";
import { unescapeHtml } from "./embedUtils";

const iframe = css`
  background-color: white;
  width: 100%;
`;

export const IFrame = ({ children }: { children: ReactChild }) => {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const mountNode = contentRef?.contentWindow?.document.body;

  // Set some default styles for the iframe body
  if (mountNode) {
    mountNode.setAttribute(
      "style",
      "font-family: Helvetica, Arial, sans-serif; font-size: 15px;"
    );
  }

  return (
    <iframe ref={setContentRef} css={iframe}>
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};

export const Preview = ({ html }: { html: string }) => {
  const [parsedHtml, setParsedHtml] = useState(unescapeHtml(html));
  useEffect(() => {
    setParsedHtml(unescapeHtml(html));
  }, [html]);
  return (
    <div>
      <Label>Preview</Label>
      <IFrame>
        <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />
      </IFrame>
    </div>
  );
};
