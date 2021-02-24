import React from "react";
import NestedEditorView from "../../mounters/preact/NestedEditorView";
import { NestedEditorMap } from "../../types/Embed";
import TFields from "../../types/Fields";

const ImageEmbed = ({
  fields: { caption, src, alt },
  errors,
  updateFields,
  editSrc,
  nestedEditors,
}: {
  fields: {
    caption: string;
    src: string;
    alt: string;
  };
  errors: { [field: string]: string[] };
  updateFields: (fields: TFields) => void;
  editSrc: boolean;
  nestedEditors: NestedEditorMap;
}) => {

  return (
    <div>
      <img style={{ width: "250px", height: "auto" }} src="localhost" alt={alt} />
      <div>
        {Object.entries(nestedEditors).map(([nameType, editor]) => <NestedEditorView key={nameType} name={nameType} editor={editor} />)}
        {editSrc && (
          <label>
            Big?
            <input
              type="checkbox"
              checked={!!src}
              onChange={(e) => {
                console.log(e.target.checked)
                e.target instanceof HTMLInputElement &&
                updateFields({ src: e.target.checked })
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageEmbed;
