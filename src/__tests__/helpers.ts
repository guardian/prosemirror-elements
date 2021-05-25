import { mount } from "../mount";
import type { FieldSpec } from "../types/Embed";

/**
 * Create an embed which renders nothing. Useful when testing schema output.
 */
export const createNoopEmbed = <
  Name extends string,
  FSpec extends FieldSpec<string>
>(
  name: Name,
  fieldSpec: FSpec
) =>
  mount(
    name,
    fieldSpec,
    () => () => null,
    () => null,
    () => null,
    {}
  );
