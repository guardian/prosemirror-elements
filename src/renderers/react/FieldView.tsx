import React, { useEffect, useRef } from "react";
import { Editor } from "../../editorial-source-components/Editor";
import type { CheckboxFieldView } from "../../plugin/fieldViews/CheckboxFieldView";
import type { DropdownFieldView } from "../../plugin/fieldViews/DropdownFieldView";
import type { RichTextFieldView } from "../../plugin/fieldViews/RichTextFieldView";
import type { TextFieldView } from "../../plugin/fieldViews/TextFieldView";
import type { FieldViewSpec } from "../../plugin/types/Element";

type Props = {
  fieldViewSpec: FieldViewSpec<
    TextFieldView | RichTextFieldView | CheckboxFieldView | DropdownFieldView
  >;
  hasErrors?: boolean;
};

export const getFieldViewTestId = (name: string) => `FieldView-${name}`;

export const FieldView: React.FunctionComponent<Props> = ({
  fieldViewSpec,
  hasErrors = false,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.appendChild(fieldViewSpec.fieldView.fieldViewElement);
  }, []);

  return (
    <Editor
      hasErrors={hasErrors}
      data-cy={getFieldViewTestId(fieldViewSpec.name)}
      ref={editorRef}
    ></Editor>
  );
};
