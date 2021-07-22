import OrderedMap from "orderedmap";
import type { Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import type { FieldNameToValueMap } from "./fieldViews/helpers";
import { buildCommands, defaultPredicate } from "./helpers/prosemirror";
import { createNodesForFieldValues } from "./nodeSpec";
import { createPlugin } from "./plugin";
import type {
  ElementSpec,
  FieldSpec,
  UnnamedElementSpec,
} from "./types/Element";

/**
 * Build an element plugin with the given element specs, along with the schema required
 * by those elements, and a method to insert elements into the document.
 */
export const buildElementPlugin = <
  FieldSpecNames extends keyof FSpec,
  FSpec extends FieldSpec<Extract<FieldSpecNames, string>>,
  ElementNames extends keyof UnnamedElementSpecs,
  UnnamedElementSpecs extends {
    [elementName in ElementNames]: UnnamedElementSpec<FSpec>;
  }
>(
  unnamedElementSpecs: UnnamedElementSpecs,
  predicate = defaultPredicate
) => {
  const elementSpecs = ({} as unknown) as {
    [Name in keyof UnnamedElementSpecs]: ElementSpec<
      FSpec,
      Extract<Name, string>
    >;
  };

  for (const elementName in unnamedElementSpecs) {
    elementSpecs[elementName] = unnamedElementSpecs[elementName](elementName);
  }

  const insertElement = <Name extends Extract<ElementNames, string>>(
    type: Name,
    fieldValues: Partial<
      FieldNameToValueMap<
        UnnamedElementSpecs[Name] extends UnnamedElementSpec<infer F>
          ? F
          : FSpec
      >
    > = {}
  ) => (
    state: EditorState,
    dispatch: (tr: Transaction<Schema>) => void
  ): void => {
    const element = elementSpecs[type];
    if (!element) {
      throw new Error(
        `[prosemirror-elements]: ${type} is not recognised. Only ${Object.keys(
          elementSpecs
        ).join(", ")} can be added`
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we cannot be sure the schema has been amended
    if (!(state.schema as Schema).nodes[type]) {
      throw new Error(
        `[prosemirror-elements]: ${type} is not included in the state schema. Did you add the NodeSpec generated by this plugin to the schema?`
      );
    }

    const nodes = createNodesForFieldValues(
      state.schema,
      element.fieldSpec,
      fieldValues
    );

    const maybeNewNode = (state.schema as Schema).nodes[type].createAndFill(
      {
        type,
      },
      nodes
    );
    if (maybeNewNode) {
      dispatch(state.tr.replaceSelectionWith(maybeNewNode));
    } else {
      console.warn(
        `[prosemirror-elements]: Could not create a node for ${type}`
      );
    }
  };

  const plugin = createPlugin(elementSpecs, buildCommands(predicate));
  let nodeSpec = OrderedMap.from({});
  for (const elementName in elementSpecs) {
    nodeSpec = nodeSpec.append(elementSpecs[elementName].nodeSpec);
  }

  return {
    insertElement,
    hasErrors: (state: EditorState) => plugin.getState(state).hasErrors,
    plugin,
    nodeSpec,
  };
};
