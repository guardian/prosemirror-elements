import type OrderedMap from "orderedmap";
import { exampleSetup } from "prosemirror-example-setup";
import type { NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { buildEmbedPlugin } from "../embed";
import { createEmbedSpec } from "../embedSpec";
import { createParsers } from "../prosemirrorSetup";
import type { EmbedSpec, FieldSpec } from "../types/Embed";

/**
 * Create an embed which renders nothing. Useful when testing schema output.
 */
export const createNoopEmbed = <
  Name extends string,
  FSpec extends FieldSpec<string>
>(
  name: Name,
  fieldSpec: FSpec
) =>
  createEmbedSpec(
    name,
    fieldSpec,
    () => () => null,
    () => null,
    () => null,
    {}
  );

export const createEditorWithEmbeds = <
  FSpec extends FieldSpec<string>,
  EmbedNames extends string
>(
  embeds: Array<EmbedSpec<FSpec, EmbedNames>>,
  initialHTML = ""
) => {
  const { plugin, insertEmbed, nodeSpec } = buildEmbedPlugin(embeds);
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

  const getEmbedAsHTML = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- YOLO test energy
    const actual = serializer.serializeNode(view.state.doc.content.firstChild!);
    const element = document.createElement("div");
    element.appendChild(actual);
    return element.innerHTML;
  };

  return { view, insertEmbed, getEmbedAsHTML };
};
