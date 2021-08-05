import { useEffect, useRef } from "react";
import { Editor } from "../../editorial-source-components/Editor";
import type { FieldView as TFieldView } from "../../plugin/fieldViews/FieldView";
import type { FieldViewSpec } from "../../plugin/types/Element";

type Props<F extends FieldViewSpec<unknown>> = {
  fieldViewSpec: F;
  hasErrors?: boolean;
};

export const getFieldViewTestId = (name: string) => `FieldView-${name}`;

export const FieldView = <F extends FieldViewSpec<TFieldView<unknown>>>({
  fieldViewSpec,
  hasErrors = false,
}: Props<F>) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!editorRef.current || !fieldViewSpec.fieldView.fieldViewElement) {
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
