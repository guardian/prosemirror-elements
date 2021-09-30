import type { NodeSpec } from "prosemirror-model";

export const useTyperighterAttr = "useTyperighter";

// An attribute to mark nodes that we'd like to be checked by Typerighter.
export const useTyperighterNodeSpec: Partial<NodeSpec> = {
  attrs: {
    useTyperighter: {
      default: true,
    },
  },
};
