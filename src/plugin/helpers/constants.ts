// A key that uniquely identifies a repeater field-to-name map. Useful for
// renderers that must be able to uniquely identify children – for example, in

import { PluginKey } from "prosemirror-state";

// React, where a `key` attribute is expected in arrays of ReactNodes.
export const RepeaterFieldMapIDKey = "__ID";

// A placeholder value for a dropdown option that represents no selection.
export const undefinedDropdownValue = "none-selected";

export const pluginKey = new PluginKey("prosemirror_elements");
