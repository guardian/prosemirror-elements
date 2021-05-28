import React, { useEffect, useRef } from "react";
import type { CheckboxNodeView } from "../../nodeViews/CheckboxNodeView";
import type { RTENodeView } from "../../nodeViews/RTENodeView";
import type { FieldNodeViewSpec } from "../../types/Element";

type Props = {
  nodeViewProp: FieldNodeViewSpec<RTENodeView | CheckboxNodeView>;
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
