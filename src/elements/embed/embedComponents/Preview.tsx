import { css } from "@emotion/react";
import { useRef, useState } from "react";
import { Label } from "../../../editorial-source-components/Label";
import { unescapeHtml } from "./embedUtils";

export const Preview = ({ html }: { html: string }) => {
  const [height, setHeight] = useState("0px");
  const [resize, setResize] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  const maxHeight = 100; // In px
  const onLoad = () => {
    const heightOfContent =
      ref.current?.contentWindow?.document.body.scrollHeight;
    if (heightOfContent && heightOfContent < maxHeight) {
      setHeight((heightOfContent + 20).toString() + "px");
    } else if (heightOfContent && heightOfContent > maxHeight) {
      setHeight((maxHeight + 20).toString() + "px");
      setResize(true);
    } else setResize(false);
  };

  const iframe = css`
    resize: ${resize ? "vertical" : "none"};
    background-color: white;
    width: 100%;
    font-family: sans-serif;
  `;

  return (
    <div>
      <Label>Preview</Label>
      <iframe
        srcDoc={unescapeHtml(html)}
        css={iframe}
        ref={ref}
        onLoad={onLoad}
        id="myFrame"
        src="http://demo_iframe.htm"
        height={height}
      />
    </div>
  );
};
