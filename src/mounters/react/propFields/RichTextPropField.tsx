import React, { useEffect, useRef } from "react";
import type { NodeViewProp } from "../../../types/Embed";
import { getPropFieldTestId } from "./PropField";

type Props = {
  nodeViewProp: NodeViewProp;
};

export const RichTextPropField: React.FunctionComponent<Props> = ({
  nodeViewProp,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.appendChild(nodeViewProp.nodeView.nodeViewElement);
  }, []);
  return (
    <div data-cy={getPropFieldTestId(nodeViewProp.prop.name)}>
      <label>
        <strong>{nodeViewProp.prop.name}</strong>
      </label>
      <div className="NestedEditorView" ref={editorRef}></div>
    </div>
  );
};
