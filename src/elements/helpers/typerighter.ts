import type { NodeSpec } from "prosemirror-model";

export const useTyperighterNodeSpec: Partial<NodeSpec> = {
  attrs: {
    useTyperighter: {
      default: true,
    },
  },
};
