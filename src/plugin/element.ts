import OrderedMap from "orderedmap";
import type { NodeSpec, ResolvedPos } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import type { SendTelemetryEvent } from "../elements/helpers/types/TelemetryEvents";
import {
  createElementDataValidator,
  createGetElementDataFromNode,
  createGetNodeFromElementData,
} from "./helpers/element";
import type { Predicate } from "./helpers/prosemirror";
import { buildCommands, defaultPredicate } from "./helpers/prosemirror";
import { getNodeSpecFromFieldDescriptions } from "./nodeSpec";
import { createPlugin } from "./plugin";
import type {
  ElementSpecMap,
  ExtractPartialDataTypeFromElementSpec,
  FieldDescriptions,
} from "./types/Element";

const findValidInsertPosition = ($pos: ResolvedPos): number | undefined => {
  const depth = $pos.depth;
  const node = $pos.node(depth);

  if (node.attrs.addUpdateDecoration) {
    return $pos.pos;
  } else if (depth > 0) {
    const newPos = $pos.doc.resolve($pos.end(depth - 1));
    return findValidInsertPosition(newPos);
  } else {
    return undefined;
  }
};

export type BuildElementPluginOptions = {
  groupName: string;
  predicate: Predicate;
  sendTelemetryEvent: SendTelemetryEvent;
};

/**
 * Build an element plugin with the given element specs, along with the schema required
 * by those elements, and a method to insert elements into the document.
 */
export const buildElementPlugin = <
  FDesc extends FieldDescriptions<Extract<keyof FDesc, string>>,
  ElementNames extends Extract<keyof ESpecMap, string>,
  ESpecMap extends ElementSpecMap<FDesc, ElementNames>
>(
  elementSpecs: ESpecMap,
  options: Partial<BuildElementPluginOptions> | undefined = undefined
) => {
  const getNodeFromElementData = createGetNodeFromElementData(elementSpecs);
  const getElementDataFromNode = createGetElementDataFromNode(elementSpecs);
  const validateElementData = createElementDataValidator(elementSpecs);

  const { groupName, predicate, sendTelemetryEvent } = {
    groupName: "block",
    predicate: defaultPredicate,
    sendTelemetryEvent: undefined,
    ...options,
  };

  const insertElement = (
    elementData: ExtractPartialDataTypeFromElementSpec<ESpecMap, ElementNames>
  ) => (state: EditorState, dispatch: (tr: Transaction) => void): void => {
    const maybeNode = getNodeFromElementData(elementData, state.schema);

    if (!maybeNode) {
      console.warn(
        `[prosemirror-elements]: Could not create a node for ${elementData.elementName}`
      );
      return;
    }

    const maybeNewPos = findValidInsertPosition(state.selection.$head);
    if (maybeNewPos) {
      dispatch(state.tr.insert(maybeNewPos, maybeNode));
    } else {
      dispatch(state.tr.replaceSelectionWith(maybeNode));
    }
  };

  const plugin = createPlugin(
    elementSpecs,
    buildCommands(predicate),
    sendTelemetryEvent
  );
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
    plugin,
    nodeSpec,
    getElementDataFromNode,
    getNodeFromElementData,
    validateElementData,
  };
};
