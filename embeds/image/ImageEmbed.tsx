import { h, VNode } from "preact";
import TFields from "../../types/Fields";

const ImageEmbed = ({
  fields: { caption, src, alt },
  errors,
  updateFields,
  editSrc
}: {
  fields: {
    caption: string;
    src: string;
    alt: string;
  };
  errors: { [field: string]: string[] };
  updateFields: (fields: TFields) => void;
  editSrc: boolean;
}) => (
  <div>
    <img style={{ width: "250px", height: "auto" }} src={src} alt={alt} />
    <label>
      Caption
      <input
        type="text"
        value={caption}
        onInput={e =>
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
        style={{ borderColor: errors.alt.length ? "red" : null }}
        onInput={e =>
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
          onInput={e =>
            e.target instanceof HTMLInputElement &&
            updateFields({ src: e.target.value })
          }
        />
      </label>
    )}
  </div>
);

export default ImageEmbed;
