import type OrderedMap from "orderedmap";
import { exampleSetup } from "prosemirror-example-setup";
import type { NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import { createParsers } from "../prosemirrorSetup";
import type { ElementSpec, FieldSpec } from "../types/Element";

/**
 * Create an element which renders nothing. Useful when testing schema output.
 */
export const createNoopElement = <
  Name extends string,
  FSpec extends FieldSpec<string>
>(
  name: Name,
  fieldSpec: FSpec
) =>
  createElementSpec(
    name,
    fieldSpec,
    () => null,
    () => null,
    {}
  );

export const createEditorWithElements = <
  FSpec extends FieldSpec<string>,
  ElementNames extends string
>(
  elements: Array<ElementSpec<FSpec, ElementNames>>,
  initialHTML = ""
) => {
  const { plugin, insertElement, nodeSpec } = buildElementPlugin(elements);
  const editorElement = document.createElement("div");
  const docElement = document.createElement("div");
  docElement.innerHTML = initialHTML;
  const schema = new Schema({
    nodes: (basicSchema.spec.nodes as OrderedMap<NodeSpec>).append(nodeSpec),
    marks: basicSchema.spec.marks,
  });
  const { serializer, parser } = createParsers(schema);
  const view = new EditorView(editorElement, {
    state: EditorState.create({
      doc: parser.parse(docElement),
      schema,
      plugins: [...exampleSetup({ schema }), plugin],
    }),
  });

  const getElementAsHTML = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- YOLO test energy
    const actual = serializer.serializeNode(view.state.doc.content.firstChild!);
    const element = document.createElement("div");
    element.appendChild(actual);
    return element.innerHTML;
  };

  return { view, insertElement, getElementAsHTML };
};
