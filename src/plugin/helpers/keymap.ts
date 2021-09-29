import { baseKeymap } from "prosemirror-commands";

const blockedKeys = ["Enter", "Mod-Enter"];

export const filteredKeymap = Object.fromEntries(
  Object.entries(baseKeymap).filter(([key]) => !blockedKeys.includes(key))
);
