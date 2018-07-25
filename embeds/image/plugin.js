import { h } from 'preact';
import preactMount from '../../mounters/preact/mount';
import ImageEmbed from './ImageEmbed';

const image = ({ editSrc = false } = {}) =>
  preactMount((fields, updateState) => (
    <ImageEmbed fields={fields} updateState={updateState} editSrc={editSrc} />
  ));

export default image;
