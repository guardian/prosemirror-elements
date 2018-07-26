import { h, Component } from 'preact';

const ImageEmbed = ({
  fields: { caption, src, alt },
  errors,
  updateFields,
  editSrc
}) => (
  <div>
    <img style={{ width: '250px', height: 'auto' }} src={src} alt={alt} />
    <label>
      Caption
      <input
        type="text"
        value={caption}
        onInput={e => updateFields({ caption: e.target.value })}
      />
    </label>
    <label>
      Alt
      <input
        type="text"
        value={alt}
        style={{ borderColor: errors.alt.length ? "red" : null }}
        onInput={e => updateFields({ alt: e.target.value })}
      />
    </label>
    {editSrc && (
      <label>
        Src
        <input
          type="text"
          value={src}
          onInput={e => updateFields({ src: e.target.value })}
        />
      </label>
    )}
  </div>
);

export default ImageEmbed;
