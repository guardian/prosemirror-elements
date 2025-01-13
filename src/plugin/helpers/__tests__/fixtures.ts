import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import type { NodeBuilder } from "prosemirror-test-builder";
import { builders } from "prosemirror-test-builder";
import { createNestedElementField } from "../../fieldViews/NestedElementFieldView";
import { createRepeaterField } from "../../fieldViews/RepeaterFieldView";
import { createTextField } from "../../fieldViews/TextFieldView";
import { RepeaterFieldMapIDKey } from "../constants";
import { createEditorWithElements, createNoopElement } from "../test";
import { maxLength, required } from "../validation";

export const elements = {
  exampleElementToNest: createNoopElement({
    content: createTextField({
      validators: [required()],
    }),
  }),
  example: createNoopElement({
    caption: createTextField({
      validators: [required(), maxLength(7)],
    }),
    html: createTextField({
      validators: [required()],
    }),
    repeated: createRepeaterField({
      repeaterText: createTextField(),
    }),
    nestedElementField: createNestedElementField({
      content: "block*",
      validators: [required()],
    }),
  }),
};

export const { view, nodeSpec, serializer } = createEditorWithElements(
  elements
);

export const schema: Schema = new Schema({
  // eslint-disable-next-line -- the basic schema types should guarantee this is a NodeSpec
  nodes: (basicSchema.spec.nodes as any).append(nodeSpec),
  marks: basicSchema.spec.marks,
});

export const {
  doc,
  example,
  example__caption,
  example__html,
  example__repeated__parent,
  example__repeated__child,
  example__repeaterText,
  example__nestedElementField,
  p,
  exampleElementToNest,
  exampleElementToNest__content,
} = (builders(schema, {
  example__repeated__child: {
    nodeType: "example__repeated__child",
    [RepeaterFieldMapIDKey]: "static-uuid",
  },
}) as unknown) as Record<string, NodeBuilder>;
