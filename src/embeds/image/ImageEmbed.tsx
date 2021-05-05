import React from "react";
import { NestedEditorView } from "../../mounters/react/NestedEditorView";
import type { NestedEditorMap } from "../../types/Embed";
import type { TImageFields } from "./types/Fields";

type Props = {
  fields: TImageFields;
  errors: Record<string, string[]>;
  updateFields: (fields: Partial<TImageFields>) => void;
  // @todo Make this schema specific to the embed once created
  nestedEditors: NestedEditorMap;
  editSrc: boolean;
};

export const ImageEmbed: React.FunctionComponent<Props> = ({
  fields: { caption, src, alt },
  errors,
  updateFields,
  editSrc,
  nestedEditors,
}) => (
  <div>
    <img style={{ width: "250px", height: "auto" }} src={src} alt={alt} />
    {Object.entries(nestedEditors).map(([nameType, editor]) => (
      <NestedEditorView key={nameType} name={nameType} editor={editor} />
    ))}

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
