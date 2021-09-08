import OrderedMap from "orderedmap";
import type { NodeSpec, Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import {
  createElementDataValidator,
  createGetElementDataFromNode,
  createGetNodeFromElementData,
} from "./helpers/element";
import { buildCommands, defaultPredicate } from "./helpers/prosemirror";
import { getNodeSpecFromFieldDescriptions } from "./nodeSpec";
import { createPlugin } from "./plugin";
import type {
  ElementSpecMap,
  ExtractPartialDataTypeFromElementSpec,
  FieldDescriptions,
} from "./types/Element";

/**
 * Build an element plugin with the given element specs, along with the schema required
 * by those elements, and a method to insert elements into the document.
 */
export const buildElementPlugin = <
  FDesc extends FieldDescriptions<keyof FDesc>,
  ElementNames extends keyof ESpecMap,
  ExternalData,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames, ExternalData>
>(
  elementSpecs: ESpecMap,
  groupName = "block",
  predicate = defaultPredicate
) => {
  const getNodeFromElementData = createGetNodeFromElementData(elementSpecs);
  const getElementDataFromNode = createGetElementDataFromNode(elementSpecs);
  const validateElementData = createElementDataValidator(elementSpecs);

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
      getNodeSpecFromFieldDescriptions(
        elementName,
        groupName,
        elementSpecs[elementName].fieldDescriptions
      )
    );
  }

  return {
    insertElement,
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
    nodeSpec,
    getElementDataFromNode,
    getNodeFromElementData,
    validateElementData,
  };
};
