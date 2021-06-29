import React, { useEffect, useRef } from "react";
import { editor } from "../../editorial-source-components/editor";
import { fieldHeading } from "../../editorial-source-components/fieldHeading";
import type { CheckboxFieldView } from "../../fieldViews/CheckboxFieldView";
import type { DropdownFieldView } from "../../fieldViews/DropdownFieldView";
import type { RichTextFieldView } from "../../fieldViews/RichTextFieldView";
import type { TextFieldView } from "../../fieldViews/TextFieldView";
import type { FieldViewSpec } from "../../types/Element";

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
      <label css={fieldHeading}>
        <strong>{fieldViewProp.name}</strong>
      </label>
      <div css={editor} ref={editorRef}></div>
    </div>
  );
};
