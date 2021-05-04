import OrderedMap from "orderedmap";
import { NodeSpec } from "prosemirror-model";
import { TCommandCreator } from "./Commands";
import TFields from "./Fields";

/**
 * A description of an embed.
 */
type TEmbed<FieldAttrs extends TFields> = {
  /**
   * The nodes the embed uses. These should be unique to the embed.
   * They will be added to the base schema.
   */
  schema: OrderedMap<NodeSpec>;

  /**
   * Called when the embed node is first added into the document.
   *
   * @param dom The DOM node the embed should be rendered into.
   * @param updateState When called, updates the embed state in the parent document.
   * @param initialFields The initial fields, as supplied by the parent document.
   * @param commands Commands to move or remove the embed.
   * @return An update function to be called when the parent document is updated.
   */
  mountEmbed: (
    dom: HTMLElement,
    updateState: (fields: FieldAttrs, hasErrors: boolean) => void,
    initialFields: FieldAttrs,
    commands: ReturnType<TCommandCreator>
  ) => (fields: FieldAttrs, commands: ReturnType<TCommandCreator>) => void;
};

export default TEmbed;
