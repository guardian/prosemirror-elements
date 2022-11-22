import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { builders } from "prosemirror-test-builder";
import { createRepeaterField } from "../../fieldViews/RepeaterFieldView";
import { createTextField } from "../../fieldViews/TextFieldView";
import { RepeaterFieldMapIDKey } from "../constants";
import { createEditorWithElements, createNoopElement } from "../test";
import { maxLength, required } from "../validation";

export const elements = {
  example: createNoopElement({
    caption: createTextField({
      validators: [required(), maxLength(7)],
    }),
    html: createTextField({
      validators: [required()],
    }),
    repeated: createRepeaterField({
      nestedText: createTextField(),
    }),
  }),
};

export const { view, nodeSpec, serializer } = createEditorWithElements(
  elements
);

export const schema = new Schema({
  // eslint-disable-next-line -- the basic schema types should guarantee this is a NodeSpec
  nodes: (basicSchema.spec.nodes as any).append(nodeSpec),
  marks: basicSchema.spec.marks,
});

export const {
  example,
  example__caption,
  example__html,
  example__repeated__parent,
  example__repeated__child,
  example__nestedText,
  p,
} = builders(schema, {
  example__repeated__child: {
    nodeType: "example__repeated__child",
    [RepeaterFieldMapIDKey]: "static-uuid",
  },
});
