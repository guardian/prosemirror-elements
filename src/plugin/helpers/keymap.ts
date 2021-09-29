import { baseKeymap } from "prosemirror-commands";

const allowedKeys = ["Mod-a", "Mod-Enter"];

export const filteredKeymap = Object.fromEntries(
  Object.entries(baseKeymap).filter(([key]) => allowedKeys.includes(key))
);
