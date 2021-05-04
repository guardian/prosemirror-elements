import { TCommandCreator } from './Commands';
import TFields from './Fields';

type TEmbed<FieldAttrs extends TFields> = (
    // The DOM node the embed should be rendered into.
    dom: HTMLElement,
    // When called, updates the embed state.
    updateState: (fields: TFields, hasErrors: boolean) => void,
    // The initial fields received by Prosemirror and applied to the embed on mount.
    initialFields: FieldAttrs,
    commands: ReturnType<TCommandCreator>
) => (fields: FieldAttrs, commands: ReturnType<TCommandCreator>) => void;

export default TEmbed;
