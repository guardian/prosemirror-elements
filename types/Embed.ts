// @todo: placeholder

import { TCommandCreator } from './Commands';
import TFields from './Fields';

type TEmbed<FieldAttrs extends TFields> = (
  dom: HTMLElement,
  updateState: (fields: TFields, hasErrors: boolean) => void,
  initFields: FieldAttrs,
  commands: ReturnType<TCommandCreator>
) => (fields: FieldAttrs) => void;

export default TEmbed;
