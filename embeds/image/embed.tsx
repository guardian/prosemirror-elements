import React from 'react';
import preactMount from '../../mounters/preact/mount';
import ImageEmbed from './ImageEmbed';
import TImageFields from './types/Fields';

const image = ({ editSrc = false } = {}) =>
  preactMount<TImageFields>(
    (fields, errors, updateFields, contentDOM) => (
      <ImageEmbed
        fields={fields}
        errors={errors}
        updateFields={updateFields}
        editSrc={editSrc}
        contentDOM={contentDOM}
      />
    ),
    ({ alt }) => (alt ? null : { alt: ['Alt tag must be set'] }),
    { caption: '', src: '', alt: '' }
  );

export default image;
