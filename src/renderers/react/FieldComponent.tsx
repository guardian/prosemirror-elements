import { useEffect, useRef } from "react";
import { Editor } from "../../editorial-source-components/Editor";
import type { FieldView } from "../../plugin/fieldViews/FieldView";
import type { Field } from "../../plugin/types/Element";

type Props<F extends Field<unknown>> = {
  field: F;
  hasValidationErrors: boolean;
};

export const getFieldViewTestId = (name: string) => `FieldView-${name}`;

export const FieldComponent = <F extends Field<FieldView<unknown>>>({
  field,
  hasValidationErrors,
}: Props<F>) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current || !field.view.fieldViewElement) {
      return;
    }
    editorRef.current.appendChild(field.view.fieldViewElement);
  }, []);

  return (
    <Editor
      data-cy={getFieldViewTestId(field.name)}
      hasValidationErrors={hasValidationErrors}
      ref={editorRef}
    ></Editor>
  );
};
