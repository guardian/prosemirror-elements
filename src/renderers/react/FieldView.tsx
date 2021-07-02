import React, { useEffect, useRef } from "react";
import { editor } from "../../editorial-source-components/editor";
import { Label } from "../../editorial-source-components/Label";
import type { CheckboxFieldView } from "../../plugin/fieldViews/CheckboxFieldView";
import type { DropdownFieldView } from "../../plugin/fieldViews/DropdownFieldView";
import type { RichTextFieldView } from "../../plugin/fieldViews/RichTextFieldView";
import type { TextFieldView } from "../../plugin/fieldViews/TextFieldView";
import type { FieldViewSpec } from "../../plugin/types/Element";

type Props = {
  fieldViewSpec: FieldViewSpec<
    TextFieldView | RichTextFieldView | CheckboxFieldView | DropdownFieldView
  >;
};

export const getFieldViewTestId = (name: string) => `FieldView-${name}`;

export const FieldView: React.FunctionComponent<Props> = ({
  fieldViewSpec,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.appendChild(fieldViewSpec.fieldView.fieldViewElement);
  }, []);

  return (
    <div data-cy={getFieldViewTestId(fieldViewSpec.name)}>
      <Label>{fieldViewSpec.name}</Label>
      <div css={editor} ref={editorRef}></div>
    </div>
  );
};
