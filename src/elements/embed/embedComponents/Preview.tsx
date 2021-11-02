import { css } from "@emotion/react";
import { Label } from "../../../editorial-source-components/Label";
import { unescapeHtml } from "./embedUtils";

const iframe = css`
  background-color: white;
  width: 100%;
`;

export const Preview = ({ html }: { html: string }) => {
  return (
    <div>
      <Label>Preview</Label>
      <iframe srcDoc={unescapeHtml(html)} css={iframe} />
    </div>
  );
};
