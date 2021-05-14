import React from "react";
import type { NodeViewProp } from "../../../types/Embed";
import { RichTextPropField } from "./RichTextPropField";

type Props = {
  nodeViewProp: NodeViewProp;
};

export const getPropFieldTestId = (name: string) => `PropField-${name}`;

/**
 * A component able to render a NodeViewProp.
 */
export const NodeViewPropField: React.FunctionComponent<Props> = ({
  nodeViewProp,
}) => {
  switch (nodeViewProp.prop.type) {
    case "richText":
      return <RichTextPropField nodeViewProp={nodeViewProp} />;
    case "checkbox":
      return <RichTextPropField nodeViewProp={nodeViewProp} />;
  }
};
