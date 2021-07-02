import type { Node, Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import type { EditorProps } from "prosemirror-view";
import type {
  ElementSpec,
  FieldNameToFieldViewSpec,
  FieldSpec,
} from "../plugin/types/Element";
import type { FieldNameToValueMap } from "./fieldViews/helpers";
import { getElementFieldViewFromType } from "./helpers/plugin";
import type { Commands } from "./helpers/prosemirror";
import { createDecorations } from "./helpers/prosemirror";

const decorations = createDecorations("imageElement");

export type PluginState = { hasErrors: boolean };

export const createPlugin = <
  ElementNames extends string,
  FSpec extends FieldSpec<string>
>(
  elementsSpec: Array<ElementSpec<FSpec, ElementNames>>,
  commands: Commands
): Plugin<PluginState, Schema> => {
  type ElementNode = Node<Schema>;

  const hasErrors = (doc: Node) => {
    let foundError = false;
    doc.descendants((node: ElementNode) => {
      if (!foundError) {
        if (node.type.name === "element") {
          foundError = node.attrs.hasErrors as boolean;
        }
      } else {
        return false;
      }
    });
    return foundError;
  };

  return new Plugin<PluginState, Schema>({
    state: {
      init: (_, state) => ({
        hasErrors: hasErrors(state.doc),
      }),
      apply: (_tr, _value, _oldState, state) => ({
        hasErrors: hasErrors(state.doc),
      }),
    },
    props: {
      decorations,
      nodeViews: createNodeViews(elementsSpec, commands),
    },
  });
};

type NodeViewSpec = NonNullable<EditorProps["nodeViews"]>;

const createNodeViews = <
  ElementNames extends string,
  FSpec extends FieldSpec<string>
>(
  elementsSpec: Array<ElementSpec<FSpec, ElementNames>>,
  commands: Commands
): NodeViewSpec => {
  const nodeViews = {} as NodeViewSpec;
  for (const element of elementsSpec) {
    nodeViews[element.name] = createNodeView(element.name, element, commands);
  }

  return nodeViews;
};

type NodeViewCreator = NodeViewSpec[keyof NodeViewSpec];

const createNodeView = <
  FSpec extends FieldSpec<string>,
  ElementName extends string
>(
  elementName: ElementName,
  element: ElementSpec<FSpec, ElementName>,
  commands: Commands
): NodeViewCreator => (initNode, view, _getPos, _, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const getPos = typeof _getPos === "boolean" ? () => 0 : _getPos;

  const fieldViewPropMap = {} as FieldNameToFieldViewSpec<FSpec>;

  initNode.forEach((node, offset) => {
    const name = node.type.name as keyof FieldNameToFieldViewSpec<FSpec>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unsure why this triggers
    if (fieldViewPropMap[name]) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${name}, but another instance with that name has already been created.`
      );
    }
    const fieldSpec = element.fieldSpec[name];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- strictly, we should check.
    if (!fieldSpec) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${name}, but could not find the associate prop`
      );
    }

    fieldViewPropMap[name] = ({
      fieldSpec,
      name,
      fieldView: getElementFieldViewFromType(fieldSpec, {
        node,
        view,
        getPos,
        offset,
        innerDecos,
      }),
      // We coerce types here: it's difficult to prove we've the right shape here
      // to the compiler, and we're already beholden to runtime behaviour as there's
      // no guarantee that the node's `name` matches our spec. The errors above should
      // help to defend when something's wrong.
    } as unknown) as FieldNameToFieldViewSpec<FSpec>[typeof name];
  });

  const update = element.createUpdator(
    dom,
    fieldViewPropMap,
    (fields, hasErrors) => {
      view.dispatch(
        view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...initNode.attrs,
          fields,
          hasErrors,
        })
      );
    },
    initNode.attrs.fields,
    commands(getPos, view)
  );

  return {
    dom,
    update: (node, _, innerDecos) => {
      if (
        node.type.name === elementName &&
        node.attrs.type === initNode.attrs.type
      ) {
        // We gather the values from each child as we iterate over the
        // node, to update the renderer. It's difficult to be typesafe here,
        // as the Node's name value is loosely typed as `string`, and so we
        // cannot index into the element `fieldSpec` to discover the appropriate type.
        const propValues: Record<string, unknown> = {};
        node.forEach((node, offset) => {
          const typeName = node.type
            .name as keyof FieldNameToFieldViewSpec<FSpec>;
          const nestedEditor = fieldViewPropMap[typeName];
          nestedEditor.fieldView.update(node, offset, innerDecos);
          propValues[typeName] = nestedEditor.fieldView.getNodeValue(node);
        });

        update(
          propValues as FieldNameToValueMap<FSpec>,
          commands(getPos, view)
        );

        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(fieldViewPropMap).map((editor) =>
        editor.fieldView.destroy()
      );
    },
    ignoreMutation: () => true,
  };
};
