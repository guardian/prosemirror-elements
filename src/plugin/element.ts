import OrderedMap from "orderedmap";
import type { NodeSpec, Schema } from "prosemirror-model";
import { DOMSerializer } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import {
  createGetElementFromNode,
  createGetNodeFromElement,
} from "./helpers/element";
import { buildCommands, defaultPredicate } from "./helpers/prosemirror";
import { getNodeSpecFromFieldSpec } from "./nodeSpec";
import { createPlugin } from "./plugin";
import type {
  ElementSpecMap,
  ExtractFieldValues,
  FieldSpec,
} from "./types/Element";

/**
 * Build an element plugin with the given element specs, along with the schema required
 * by those elements, and a method to insert elements into the document.
 */
export const buildElementPlugin = <
  FSpec extends FieldSpec<keyof FSpec>,
  ElementNames extends keyof ESpecMap,
  ESpecMap extends ElementSpecMap<FSpec, ElementNames>
>(
  elementSpecs: ESpecMap,
  predicate = defaultPredicate
) => {
  const getNodeFromElement = createGetNodeFromElement(elementSpecs);
  const getElementFromNode = createGetElementFromNode(elementSpecs);

  const insertElement = <Name extends ElementNames>(
    elementName: Extract<Name, string>,
    fieldValues: ExtractFieldValues<ESpecMap[Name]> = {}
  ) => (
    state: EditorState,
    dispatch: (tr: Transaction<Schema>) => void
  ): void => {
    const maybeNode = getNodeFromElement(
      elementName,
      fieldValues,
      state.schema
    );

    if (maybeNode) {
      dispatch(state.tr.replaceSelectionWith(maybeNode));
    } else {
      console.warn(
        `[prosemirror-elements]: Could not create a node for ${elementName}`
      );
    }
  };

  const plugin = createPlugin(elementSpecs, buildCommands(predicate));
  let nodeSpec: OrderedMap<NodeSpec> = OrderedMap.from({});
  for (const elementName in elementSpecs) {
    nodeSpec = nodeSpec.append(
      getNodeSpecFromFieldSpec(elementName, elementSpecs[elementName].fieldSpec)
    );
  }

  return {
    insertElement,
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
    nodeSpec,
    getElementFromNode,
    getNodeFromElement,
  };
};
