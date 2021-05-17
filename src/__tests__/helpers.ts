import { mount } from "../mount";
import type { EmbedProps } from "../types/Embed";

/**
 * Create an embed which renders nothing. Useful when testing schema output.
 */
export const createNoopEmbed = <
  Name extends string,
  Props extends EmbedProps<string>
>(
  name: Name,
  props: Props
) =>
  mount(
    name,
    props,
    () => () => null,
    () => null,
    () => null,
    {}
  );
