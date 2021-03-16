import TFields from "./types/Fields";
import TEmbed from "./types/Embed";
import { TCommands, TCommandCreator } from "./types/Commands";

const createUpdater = () => {
  let sub: (...args: any[]) => void = () => {};
  return {
    subscribe: (fn: (...args: any[]) => void) => {
      sub = fn;
    },
    update: (...args: any[]) => sub(...args),
  };
};

type EmbedMounter = (
  dom: HTMLElement,
  updateState: (fields: TFields, hasErrors: boolean) => void,
  fields: TFields,
  commands: TCommands,
  subscribe: (
    fn: (fields: TFields, commands: ReturnType<TCommandCreator>) => void
  ) => void
) => void;

/**
 * Apply an embed mounter – a function that describes a way to draw embeds and manage their state.
 *
 * Mounters are agnostic as to how rendering happens. We provide an example in React, but any
 * other way to manage application state and render it into a DOM node is equally applicable.
 *
 * @param mount The function provided by the mounter to render the embed.
 */
const applyMount = <FieldAttrs extends TFields>(mount: EmbedMounter): TEmbed<FieldAttrs> =>
    /**
     * The function called by the Embed plugin to mount an embed.
     */
    (dom, updateState, initialFields, commands) => {
      const updater = createUpdater();
      mount(
        dom,
        updateState,
        initialFields,
        commands,
        updater.subscribe
      );
      return updater.update;
    };

export default applyMount;
