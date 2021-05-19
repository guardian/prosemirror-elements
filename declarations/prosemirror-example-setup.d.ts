declare module "prosemirror-example-setup" {
  import type { Schema } from "prosemirror-model";
  import type { Plugin } from "prosemirror-state";

  const exampleSetup: ({ schema }: { schema: Schema }) => Plugin[];
}
