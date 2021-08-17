import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { CustomFieldView } from "../../plugin/fieldViews/CustomFieldView";
import type { CustomFieldViewSpec } from "../../plugin/types/Element";

export const useCustomFieldViewState = <Data extends unknown>({
  fieldDescription,
  fieldView,
}: CustomFieldViewSpec<Data>): [
  Data,
  MutableRefObject<((fields: Data) => void) | undefined>
] => {
  const [fieldValue, setFieldValue] = useState(fieldDescription.defaultValue);

  const updateRef = useRef<(fields: Data) => void>();

  useEffect(() => {
    if (!(fieldView instanceof CustomFieldView)) {
      console.error(
        `[prosemirror-elements]: An CustomFieldView component was passed a fieldView that wasn't a CustomFieldView. Instead it got a ${typeof fieldView}`
      );
      return;
    }
    updateRef.current = fieldView.subscribe(setFieldValue);

    return () => fieldView.unsubscribe(setFieldValue);
  }, []);

  return [fieldValue, updateRef];
};
