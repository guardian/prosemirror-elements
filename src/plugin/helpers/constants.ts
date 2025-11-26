import { PluginKey } from "prosemirror-state";
import type { PluginState } from "../plugin";

// A key that uniquely identifies a repeater field-to-name map. Useful for
// renderers that must be able to uniquely identify children – for example, in
// React, where a `key` attribute is expected in arrays of ReactNodes.
export const RepeaterFieldMapIDKey = "__ID";

// A placeholder value for a dropdown option that represents no selection.
export const undefinedDropdownValue = "none-selected";

export const pluginKey = new PluginKey<PluginState>("prosemirror_elements");

export const buttonWidth = 32;
export const actionSpacing = buttonWidth;
