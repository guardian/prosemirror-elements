import type OrderedMap from "orderedmap";
import { exampleSetup } from "prosemirror-example-setup";
import type { NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import type { ElementSpecMap, FieldSpec } from "../types/Element";
import { createParsers } from "./prosemirror";

const initialPhrase = "deco";
const key = new PluginKey<string>("TEST_DECO_PLUGIN");
export const ChangeTestDecoStringAction = "CHANGE_TEST_DECO_STRING";

export const testDecorationPlugin = new Plugin<string>({
  key,
  state: {
    init() {
      return initialPhrase;
    },
    apply(tr, oldTestString) {
      const maybeNewTestString = tr.getMeta(ChangeTestDecoStringAction) as
        | string
        | undefined;
      return maybeNewTestString ?? oldTestString;
    },
  },
  props: {
    decorations: (state) => {
      const testString = key.getState(state) ?? initialPhrase;
      const ranges = [] as Array<[number, number]>;
      state.doc.descendants((node, offset) => {
        if (node.isLeaf && node.textContent) {
          const indexOfDeco = node.textContent.indexOf(testString);
          if (indexOfDeco !== -1) {
            ranges.push([
              indexOfDeco + offset,
              indexOfDeco + offset + testString.length,
            ]);
          }
        }
      });

      return DecorationSet.create(
        state.doc,
        ranges.map(([from, to]) =>
          Decoration.inline(from, to, { class: "TestDecoration" })
        )
      );
    },
  },
});

export const trimHtml = (html: string) => html.replace(/>\s+</g, "><").trim();

/**
 * Create an element which renders nothing. Useful when testing schema output.
 */
export const createNoopElement = <FSpec extends FieldSpec<string>>(
  fieldSpec: FSpec
) =>
  createElementSpec(
    fieldSpec,
    () => null,
    () => null,
    {}
  );

export const createEditorWithElements = <
  FSpec extends FieldSpec<keyof FSpec>,
  ElementNames extends keyof UESpecs,
  UESpecs extends ElementSpecMap<FSpec, ElementNames>
>(
  elements: UESpecs,
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
