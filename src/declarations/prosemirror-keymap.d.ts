declare module "prosemirror-keymap" {
  import type { Command } from "prosemirror-commands";
  import type { Plugin } from "prosemirror-state";

  const keymap: (map: Record<string, Command>) => Plugin;
}
