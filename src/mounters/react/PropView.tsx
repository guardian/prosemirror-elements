import React, { useEffect, useRef } from "react";
import type { FieldNodeViewSpec } from "../../types/Embed";

type Props = {
  nodeViewProp: FieldNodeViewSpec;
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
    <div data-cy={getPropViewTestId(nodeViewProp.name)}>
      <label>
        <strong>{nodeViewProp.name}</strong>
      </label>
      <div ref={editorRef}></div>
    </div>
  );
};
