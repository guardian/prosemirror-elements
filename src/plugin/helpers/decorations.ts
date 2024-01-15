import type { DecorationSet, DecorationSource } from "prosemirror-view";

// prosemirror type that prosemirror doesn't export
export type DecorationGroup = {
  members: DecorationSet[];
};

export const isDecorationGroup = (
  decoration: DecorationSource | DecorationGroup
): decoration is DecorationGroup => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Typescript is unhappy with other variations
  return (decoration as DecorationGroup).members !== undefined;
};

export const isDecorationSet = (
  decoration: DecorationSet | DecorationSource
): decoration is DecorationSet => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Typescript is unhappy with other variations
  return (decoration as DecorationSet).find !== undefined;
};
