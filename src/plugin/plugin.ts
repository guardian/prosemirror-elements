import type { Node, Schema } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
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
import { getFieldNameFromNode } from "./nodeSpec";

const decorations = createDecorations("imageElement");
const pluginKey = new PluginKey("prosemirror_elements");

export type PluginState = { hasErrors: boolean };

export const createPlugin = <
  ElementNames extends string,
  FSpec extends FieldSpec<string>
>(
  elementsSpec: {
    [elementName in ElementNames]: ElementSpec<FSpec>;
  },
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
    key: pluginKey,
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
  elementsSpec: {
    [elementName in ElementNames]: ElementSpec<FSpec>;
  },
  commands: Commands
): NodeViewSpec => {
  const nodeViews = {} as NodeViewSpec;
  for (const elementName in elementsSpec) {
    nodeViews[elementName] = createNodeView(
      elementName,
      elementsSpec[elementName],
      commands
    );
  }

  return nodeViews;
};

type NodeViewCreator = NodeViewSpec[keyof NodeViewSpec];

const createNodeView = <
  FSpec extends FieldSpec<string>,
  ElementName extends string
>(
  elementName: ElementName,
  element: ElementSpec<FSpec>,
  commands: Commands
): NodeViewCreator => (initNode, view, _getPos, _, innerDecos) => {
  const dom = document.createElement("div");
  dom.contentEditable = "false";
  const getPos = typeof _getPos === "boolean" ? () => 0 : _getPos;

  const fieldViewSpecs = {} as FieldNameToFieldViewSpec<FSpec>;

  initNode.forEach((node, offset) => {
    const name = getFieldNameFromNode(
      node
    ) as keyof FieldNameToFieldViewSpec<FSpec>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unsure why this triggers
    if (fieldViewSpecs[name]) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${name}, but another instance with that name has already been created.`
      );
    }
    const fieldSpec = element.fieldSpec[name];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- strictly, we should check.
    if (!fieldSpec) {
      throw new Error(
        `[prosemirror-elements]: Attempted to instantiate a nodeView with type ${name}, but could not find the associate field`
      );
    }

    const fieldView = getElementFieldViewFromType(fieldSpec, {
      node,
      view,
      getPos,
      offset,
      innerDecos,
    });

    fieldViewSpecs[name] = ({
      fieldSpec,
      name,
      fieldView,
      // We coerce types here: it's difficult to prove we've the right shape here
      // to the compiler, and we're already beholden to runtime behaviour as there's
      // no guarantee that the node's `name` matches our spec. The errors above should
      // help to defend when something's wrong.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- as above
      update: (value: unknown) => fieldView.update(value as any),
    } as unknown) as FieldNameToFieldViewSpec<FSpec>[typeof name];
  });

  const update = element.createUpdator(
    dom,
    fieldViewSpecs,
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
        const fieldValues: Record<string, unknown> = {};
        node.forEach((node, offset) => {
          const fieldName = getFieldNameFromNode(
            node
          ) as keyof FieldNameToFieldViewSpec<FSpec>;
          const fieldViewSpec = fieldViewSpecs[fieldName];
          fieldViewSpec.fieldView.onUpdate(node, offset, innerDecos);
          fieldValues[fieldName] = fieldViewSpec.fieldView.getNodeValue(node);
        });

        update(
          fieldValues as FieldNameToValueMap<FSpec>,
          commands(getPos, view)
        );

        return true;
      }
      return false;
    },
    stopEvent: () => true,
    destroy: () => {
      Object.values(fieldViewSpecs).map((fieldViewSpec) =>
        fieldViewSpec.fieldView.destroy()
      );
    },
    ignoreMutation: () => true,
  };
};
