import React from "react";
import type { TFields } from "../../types/Fields";

type Props = {
  fields: {
    caption: string;
    src: string;
    alt: string;
  };
  errors: Record<string, string[]>;
  updateFields: (fields: TFields) => void;
  editSrc: boolean;
};

export const ImageEmbed: React.FunctionComponent<Props> = ({
  fields: { caption, src, alt },
  errors,
  updateFields,
  editSrc,
}) => (
  <div>
    <img style={{ width: "250px", height: "auto" }} src={src} alt={alt} />
    <div>
      <label>
        Caption
        <input
          type="text"
          value={caption}
          onInput={(e) =>
            e.target instanceof HTMLInputElement &&
            updateFields({ caption: e.target.value })
          }
        />
      </label>
      <label>
        Alt
        <input
          type="text"
          value={alt}
          style={{ borderColor: errors.alt.length ? "red" : undefined }}
          onInput={(e) =>
            e.target instanceof HTMLInputElement &&
            updateFields({ alt: e.target.value })
          }
        />
      </label>
      {editSrc && (
        <label>
          Src
          <input
            type="text"
            value={src}
            onInput={(e) =>
              e.target instanceof HTMLInputElement &&
              updateFields({ src: e.target.value })
            }
          />
        </label>
      )}
    </div>
  </div>
);
