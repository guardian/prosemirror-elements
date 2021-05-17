import { mount } from "../mount";
import type { EmbedProps } from "../types/Embed";

/**
 * Create an embed which renders nothing. Useful when testing schema output.
 */
export const createNoopEmbed = (name: string, props: EmbedProps<string>) =>
  mount(
    name,
    props,
    () => () => null,
    () => null,
    () => null,
    {}
  );
