// @todo: placeholder

import { RTENode } from '../RTENode';
import { TCommandCreator } from './Commands';
import TFields from './Fields';

export type NestedEditorMap = {[typeName: string]: RTENode}

type TEmbedCreator<FieldAttrs extends TFields> = (
    dom: HTMLElement,
    nestedEditors: NestedEditorMap,
    updateState: (fields: TFields, hasErrors: boolean) => void,
    initFields: FieldAttrs,
    commands: ReturnType<TCommandCreator>
) => (fields: FieldAttrs, commands: ReturnType<TCommandCreator>) => void;

export default TEmbedCreator;
