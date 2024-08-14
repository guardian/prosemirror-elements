import { exampleSetup } from "prosemirror-example-setup";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { buildElementPlugin } from "../element";
import { createElementSpec } from "../elementSpec";
import type { ElementSpecMap, FieldDescriptions } from "../types/Element";
import { createParsers } from "./prosemirror";

const initialDecoPhrase = "deco";
const initialWidgetDecoPhrase = "widget";
const testDecorationPluginKey = new PluginKey<string>("TEST_DECO_PLUGIN");
const testWidgetDecorationPluginKey = new PluginKey<string>("TEST_WIDGET_DECO_PLUGIN");
export const ChangeTestDecoStringAction = "CHANGE_TEST_DECO_STRING";

export const testDecorationPlugin = new Plugin<string>({
  key: testDecorationPluginKey,
  state: {
    init() {
      return initialDecoPhrase;
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
      const testString =
        testDecorationPluginKey.getState(state) ?? initialDecoPhrase;
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

const getTestWidgetDecoration = () => {
  const span = document.createElement("span");
  span.style.display = "inline-block";
  span.style.width = "2px";
  span.style.height = "0.7rem";
  span.style.backgroundColor = "#FF0000";
  span.setAttribute("data-cy", "TestWidgetDecoration");

  return span;
};

// A plugin for use in the demo that adds a small red line on either side of the word 'widget',
// the first time it appears in a text node. This makes it simple for us to test Widget decorations
// within the demo.
export const testWidgetDecorationPlugin = new Plugin<string>({
  key: testWidgetDecorationPluginKey,
  state: {
    init() {
      return initialWidgetDecoPhrase;
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
      const testString =
        testWidgetDecorationPluginKey.getState(state) ?? initialWidgetDecoPhrase;
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
        ranges.flatMap(([from, to]) =>
          [Decoration.widget(to, getTestWidgetDecoration, { isTestWidgetDeco: true} ),
          Decoration.widget(from, getTestWidgetDecoration, { isTestWidgetDeco: true})]
        )
      );
    },
  },
});

const testInnerEditorEventPropagationPluginKey = new PluginKey<string>(
  "TEST_INNER_EDITOR_EVENT_PROPAGATION_PLUGIN"
);
export const testInnerEditorEventPropagationPlugin = new Plugin<string>({
  key: testInnerEditorEventPropagationPluginKey,
  props: {
    handleClick: (view, pos, event) => {
      console.log(
        "click event received in",
        testInnerEditorEventPropagationPluginKey,
        { view, pos, event }
      );
      // @ts-expect-error - just using for testing so don't want to add to the window type
      window.viewPassedToPlugin = view;
    },
  },
});

export const trimHtml = (html: string) => html.replace(/>\s+</g, "><").trim();

/**
 * Create an element which renders nothing. Useful when testing schema output.
 */
export const createNoopElement = <FDesc extends FieldDescriptions<string>>(
  fieldDescriptions: FDesc
) =>
  createElementSpec(
    fieldDescriptions,
    () => null,
    () => undefined,
    () => undefined
  );

export const createEditorWithElements = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpecMap, string>,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames>
>(
  elements: ESpecMap,
  initialHTML = "",
  plugins: Plugin[] = []
) => {
  const {
    plugin,
    insertElement,
    nodeSpec,
    getNodeFromElementData,
    getElementDataFromNode,
    validateElementData,
  } = buildElementPlugin(elements);
  const editorElement = document.createElement("div");
  const docElement = document.createElement("div");
  docElement.innerHTML = initialHTML;
  const schema = new Schema({
    nodes: basicSchema.spec.nodes.append(nodeSpec),
    marks: basicSchema.spec.marks,
  });
  const { serializer, parser } = createParsers(schema);
  const view = new EditorView(editorElement, {
    state: EditorState.create({
      doc: parser.parse(docElement),
      schema,
      plugins: [...exampleSetup({ schema }), plugin, ...plugins],
    }),
  });

  const getElementAsHTML = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- YOLO test energy
    const actual = serializer.serializeNode(view.state.doc.content.firstChild!);
    const element = document.createElement("div");
    element.appendChild(actual);
    return element.innerHTML;
  };

  const getDocAsHTML = () => {
    const actual = serializer.serializeFragment(view.state.doc.content);
    const element = document.createElement("div");
    element.appendChild(actual);
    return element.innerHTML;
  };

  return {
    view,
    nodeSpec,
    schema,
    insertElement,
    getElementAsHTML,
    getDocAsHTML,
    getNodeFromElementData,
    getElementDataFromNode,
    serializer,
    validateElementData,
  };
};

export const getDecoSpecs = (decoSet: DecorationSet) =>
  decoSet.find().map(({ from, to }) => ({
    from,
    to,
  }));
