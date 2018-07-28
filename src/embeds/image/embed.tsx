import { h } from 'preact';
import preactMount from '../../mounters/preact/mount';
import ImageEmbed from './ImageEmbed';
import TImageFields from './types/Fields';
import EmbedWrapper from '../EmbedWrapper';

const image = ({ editSrc = false } = {}) =>
  preactMount<TImageFields>(
    (fields, errors, commands, updateFields) => (
      <EmbedWrapper name="Image" {...commands}>
        <ImageEmbed
          fields={fields}
          errors={errors}
          updateFields={updateFields}
          editSrc={editSrc}
        />
      </EmbedWrapper>
    ),
    ({ alt }) => (alt ? null : { alt: ['Alt tag must be set'] }),
    { caption: '', src: '', alt: '' }
  );

export default image;
