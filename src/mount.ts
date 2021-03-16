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

// @placeholder
type TRenderer<T> = (
  dom: HTMLElement,
  updateState: (fields: TFields, hasErrors: boolean) => void,
  fields: TFields,
  commands: TCommands,
  subscribe: (
    fn: (fields: TFields, commands: ReturnType<TCommandCreator>) => void
  ) => void
) => void;

/**
 * Apply a mounter – a function that describes a way to draw embeds.
 *
 * @param render The function provided by the mounter to render the embed.
 */
const applyMount = <RenderReturn, FieldAttrs extends TFields>(render: TRenderer<RenderReturn>): TEmbed<FieldAttrs> =>
    /**
     * The function called by the Embed plugin to mount an embed.
     */
    (dom, updateState, initialFields, commands) => {
      const updater = createUpdater();
      render(
        dom,
        updateState,
        initialFields,
        commands,
        updater.subscribe
      );
      return updater.update;
    };

export default applyMount;
