import { h } from 'preact';
import preactMount from '../../mounters/preact/mount';
import ImageEmbed from './ImageEmbed';

const image = ({ editSrc = false } = {}) =>
  preactMount(
    (fields, errors, updateFields) => (
      <ImageEmbed
        fields={fields}
        errors={errors}
        updateFields={updateFields}
        editSrc={editSrc}
      />
    ),
    ({ alt }) => (alt ? null : { alt: ['Alt tag must be set'] })
  );

export default image;
