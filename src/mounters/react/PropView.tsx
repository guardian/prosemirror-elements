import React, { useEffect, useRef } from "react";
import type { NodeViewProp } from "../../types/Embed";

type Props = {
  nodeViewProp: NodeViewProp;
};

export const getPropViewTestId = (name: string) => `PropField-${name}`;

export const PropView: React.FunctionComponent<Props> = ({ nodeViewProp }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.appendChild(nodeViewProp.nodeView.nodeViewElement);
  }, []);
  return (
    <div data-cy={getPropViewTestId(nodeViewProp.prop.name)}>
      <label>
        <strong>{nodeViewProp.prop.name}</strong>
      </label>
      <div className="NestedEditorView" ref={editorRef}></div>
    </div>
  );
};
