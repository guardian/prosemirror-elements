import React, { useEffect, useRef } from "react";
import TFields from "../../types/Fields";

const ImageEmbed = ({
  fields: { caption, src, alt },
  errors,
  updateFields,
  editSrc,
  contentDOM,
}: {
  fields: {
    caption: string;
    src: string;
    alt: string;
  };
  errors: { [field: string]: string[] };
  updateFields: (fields: TFields) => void;
  editSrc: boolean;
  contentDOM: HTMLElement;
}) => {
  const contentDOMParentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!contentDOMParentRef.current) {
      return;
    }
    contentDOMParentRef.current.appendChild(contentDOM);
  }, []);
  return (
    <div>
      <img style={{ width: "250px", height: "auto" }} src={src} alt={alt} />
      <div>
        <div className="image-parent" ref={contentDOMParentRef}></div>
        {editSrc && (
          <label>
            Big?
            <input
              type="checkbox"
              checked={src}
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
