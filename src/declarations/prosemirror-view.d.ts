import type { Node } from "prosemirror-model";
import type { Mapping } from "prosemirror-transform";
import type { DecorationSet, DecorationSource } from "prosemirror-view";

declare module "prosemirror-view" {
  // The type of this class isn't made available by prosemirror-view - we should request a change there to make
  // it available as we have to interact with instance of it
  class DecorationGroup implements DecorationSource {
    readonly members: readonly DecorationSet[];
    constructor(members: readonly DecorationSet[]);
    map(mapping: Mapping, doc: Node): DecorationSource;
    forChild(offset: number, child: Node): DecorationSource | DecorationSet;
    eq(other: DecorationGroup): boolean;
    locals(node: Node): readonly any[];
    static from(members: readonly DecorationSource[]): DecorationSource;
  }
}