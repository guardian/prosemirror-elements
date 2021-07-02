import React, { useEffect, useRef } from "react";
import { editor } from "../../editorial-source-components/editor";
import { Label } from "../../editorial-source-components/Label";
import type { CheckboxFieldView } from "../../plugin/fieldViews/CheckboxFieldView";
import type { DropdownFieldView } from "../../plugin/fieldViews/DropdownFieldView";
import type { RichTextFieldView } from "../../plugin/fieldViews/RichTextFieldView";
import type { TextFieldView } from "../../plugin/fieldViews/TextFieldView";
import type { FieldViewSpec } from "../../plugin/types/Element";

type Props = {
  fieldViewProp: FieldViewSpec<
    TextFieldView | RichTextFieldView | CheckboxFieldView | DropdownFieldView
  >;
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
      <Label>{fieldViewProp.name}</Label>
      <div css={editor} ref={editorRef}></div>
    </div>
  );
};
