import { mount } from "../mount";
import type { ElementProps } from "../types/Embed";

/**
 * Create an embed which renders nothing. Useful when testing schema output.
 */
export const createNoopEmbed = (name: string, props: ElementProps) =>
  mount(
    name,
    props,
    () => () => null,
    () => null,
    () => null,
    {}
  );
