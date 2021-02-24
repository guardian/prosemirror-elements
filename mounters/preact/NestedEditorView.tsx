import { EditorView } from "prosemirror-view";
import React, { useEffect, useRef } from "react";

const NestedEditorView = ({ name, editor }: { name: string, editor: EditorView }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.appendChild(editor.dom);
  }, []);
  return (
    <div>
      <label><strong>{name}</strong></label>
      <div className="NestedEditorView" ref={editorRef}></div>
      </div>
  );
};

export default NestedEditorView;
