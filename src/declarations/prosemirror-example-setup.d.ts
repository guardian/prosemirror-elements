declare module "prosemirror-example-setup" {
  import type { Schema } from "prosemirror-model";
  import type { Plugin } from "prosemirror-state";

  const exampleSetup: ({
    schema,
    menuBar,
    history,
  }: {
    schema: Schema;
    menuBar?: boolean;
    history?: boolean;
  }) => Plugin[];
}
