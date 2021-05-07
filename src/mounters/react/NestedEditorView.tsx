import type { Schema } from "prosemirror-model";
import React, { useEffect, useRef } from "react";
import type { RTENodeView } from "../../nodeViews/RTENode";

type Props = {
  name: string;
  editor: RTENodeView<Schema>;
};

export const getNestedViewTestId = (name: string) => `NestedEditorView-${name}`;

export const NestedEditorView: React.FunctionComponent<Props> = ({
  name,
  editor,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.appendChild(editor.dom);
  }, []);
  return (
    <div data-cy={getNestedViewTestId(name)}>
      <label>
        <strong>{name}</strong>
      </label>
      <div className="NestedEditorView" ref={editorRef}></div>
    </div>
  );
};
