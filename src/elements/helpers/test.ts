import { omit } from "lodash";
import type { MarkSpec, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema, marks } from "prosemirror-schema-basic";
import { createParsers } from "../../plugin/helpers/prosemirror";

/**
 * Creates a basic schema, and associated parsers/serializers, with enough
 * scaffolding to satisfy basic test cases. Pass a nodeSpec to add the spec to
 * the schema.
 */
export const createTestSchema = (nodeSpec: NodeSpec) => {
  const strike: MarkSpec = {
    parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }],
    toDOM() {
      return ["s"];
    },
  };

  const schema = new Schema({
    nodes: basicSchema.spec.nodes.append(nodeSpec),
    marks: { ...omit(marks, "code"), strike },
  });
  const { serializer, parser } = createParsers(schema);

  return {
    schema,
    serializer,
    parser,
  };
};
