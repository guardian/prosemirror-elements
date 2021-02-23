// @todo: placeholder

import { TCommandCreator } from './Commands';
import TFields from './Fields';

type TEmbedCreator<FieldAttrs extends TFields> = (
    dom: HTMLElement,
    contentDOM: HTMLElement,
    updateState: (fields: TFields, hasErrors: boolean) => void,
    initFields: FieldAttrs,
    commands: ReturnType<TCommandCreator>
) => (fields: FieldAttrs, commands: ReturnType<TCommandCreator>) => void;

export default TEmbedCreator;
