declare module "prosemirror-keymap" {
  import type { Plugin } from "prosemirror-state";

  const keymap: (map: Record<string, () => void>) => Plugin;
}
