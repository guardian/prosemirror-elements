import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { CustomFieldView } from "../../plugin/fieldViews/CustomFieldView";
import type { CustomField } from "../../plugin/types/Element";

export const useCustomFieldViewState = <Data extends unknown>({
  description,
  view,
}: CustomField<Data>): [
  Data,
  MutableRefObject<((fields: Data) => void) | undefined>
] => {
  const [fieldValue, setFieldValue] = useState(description.defaultValue);

  const updateRef = useRef<(fields: Data) => void>();

  useEffect(() => {
    if (!(view instanceof CustomFieldView)) {
      console.error(
        `[prosemirror-elements]: An CustomFieldView component was passed a fieldView that wasn't a CustomFieldView. Instead it got a ${typeof view}`
      );
      return;
    }
    updateRef.current = view.subscribe(setFieldValue);

    return () => view.unsubscribe(setFieldValue);
  }, []);

  return [fieldValue, updateRef];
};
