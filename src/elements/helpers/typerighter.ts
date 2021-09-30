import type { AttributeSpec } from "prosemirror-model";

export const useTyperighterAttr = "useTyperighter";

// An attribute to mark nodes that we'd like to be checked by Typerighter.
export const useTyperighterAttrs: Record<string, AttributeSpec> = {
  useTyperighter: {
    default: true,
  },
};
