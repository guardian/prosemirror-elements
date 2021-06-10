import React, { useEffect, useRef } from "react";
import type { CheckboxFieldView } from "../../fieldViews/CheckboxFieldView";
import type { RichTextFieldView } from "../../fieldViews/RichTextFieldView";
import { TextFieldView } from "../../fieldViews/TextFieldView";
import type { FieldViewSpec } from "../../types/Element";

type Props = {
  fieldViewProp: FieldViewSpec<TextFieldView | RichTextFieldView | CheckboxFieldView>;
};

export const getPropViewTestId = (name: string) => `PropField-${name}`;

export const PropView: React.FunctionComponent<Props> = ({ fieldViewProp }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.appendChild(fieldViewProp.fieldView.fieldViewElement);
  }, []);

  return (
    <div data-cy={getPropViewTestId(fieldViewProp.name)}>
      <label>
        <strong>{fieldViewProp.name}</strong>
      </label>
      <div ref={editorRef}></div>
    </div>
  );
};
