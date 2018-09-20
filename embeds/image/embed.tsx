import { h } from 'preact';
import preactMount from '../../mounters/preact/mount';
import ImageEmbed from './ImageEmbed';
import TImageFields from './types/Fields';

const image = ({ editSrc = false } = {}) =>
  preactMount<TImageFields>(
    (fields, errors, updateFields) => (
      <ImageEmbed
        fields={fields}
        errors={errors}
        updateFields={updateFields}
        editSrc={editSrc}
      />
    ),
    ({ alt }) => (alt ? null : { alt: ['Alt tag must be set'] }),
    { caption: '', src: '', alt: '' }
  );

export default image;
