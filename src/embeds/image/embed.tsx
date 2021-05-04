import OrderedMap from 'orderedmap';
import { NodeSpec } from 'prosemirror-model';
import React from 'react';
import reactMount from '../../mounters/react/mount';
import ImageEmbed from './ImageEmbed';
import TImageFields from './types/Fields';

const imageSchema: OrderedMap<NodeSpec> = OrderedMap.from({})

const image = ({ editSrc = false } = {}) =>
  reactMount<TImageFields>(
    (fields, errors, updateFields) => (
      <ImageEmbed
        fields={fields}
        errors={errors}
        updateFields={updateFields}
        editSrc={editSrc}
      />
    ),
    imageSchema,
    ({ alt }) => (alt ? null : { alt: ['Alt tag must be set'] }),
    { caption: '', src: '', alt: '' },
  );

export default image;
