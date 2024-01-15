import { DecorationSet, DecorationSource } from "prosemirror-view";

// prosemirror type that prosemirror doesn't export
export type DecorationGroup = {
    members: DecorationSet[]
}

export const isDecorationGroup = (decoration: DecorationSource | DecorationGroup): decoration is DecorationGroup => {
    return (decoration as DecorationGroup).members !== undefined;
}

export const isDecorationSet = (decoration: DecorationSet | DecorationSource): decoration is DecorationSet => {
    return (decoration as DecorationSet).find !== undefined;
}
