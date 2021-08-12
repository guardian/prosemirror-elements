import OrderedMap from "orderedmap";
import type { NodeSpec, Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import {
  createGetElementDataFromNode,
  createGetNodeFromElementData,
} from "./helpers/element";
import { buildCommands, defaultPredicate } from "./helpers/prosemirror";
import { getNodeSpecFromFieldSpec } from "./nodeSpec";
import { createPlugin } from "./plugin";
import type {
  ElementSpecMap,
  ExtractPartialDataTypeFromElementSpec,
  FieldSpec,
} from "./types/Element";

/**
 * Build an element plugin with the given element specs, along with the schema required
 * by those elements, and a method to insert elements into the document.
 */
export const buildElementPlugin = <
  FSpec extends FieldSpec<keyof FSpec>,
  ElementNames extends keyof ESpecMap,
  ExternalData,
  ESpecMap extends ElementSpecMap<FSpec, ElementNames, ExternalData>
>(
  elementSpecs: ESpecMap,
  predicate = defaultPredicate
) => {
  const getNodeFromElementData = createGetNodeFromElementData(elementSpecs);
  const getElementDataFromNode = createGetElementDataFromNode(elementSpecs);

  const insertElement = (
    elementData: ExtractPartialDataTypeFromElementSpec<ESpecMap, ElementNames>
  ) => (
    state: EditorState,
    dispatch: (tr: Transaction<Schema>) => void
  ): void => {
    const maybeNode = getNodeFromElementData(elementData, state.schema);

    if (maybeNode) {
      dispatch(state.tr.replaceSelectionWith(maybeNode));
    } else {
      console.warn(
        `[prosemirror-elements]: Could not create a node for ${elementData.elementName}`
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
    getElementDataFromNode,
    getNodeFromElementData,
  };
};
