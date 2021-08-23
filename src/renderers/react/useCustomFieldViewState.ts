import { useEffect, useState } from "react";
import { CustomFieldView } from "../../plugin/fieldViews/CustomFieldView";
import type { CustomField } from "../../plugin/types/Element";

export const useCustomFieldState = <Data extends unknown>({
  description,
  view,
}: CustomField<Data>): [Data, (fields: Data) => void] => {
  const [fieldValue, setFieldValue] = useState(description.defaultValue);

  useEffect(() => {
    if (!(view instanceof CustomFieldView)) {
      console.error(
        `[prosemirror-elements]: An CustomFieldView component was passed a fieldView that wasn't a CustomFieldView. Instead it got a ${typeof view}`
      );
      return;
    }
    view.subscribe(setFieldValue);

    return () => view.unsubscribe(setFieldValue);
  }, []);

  return [
    fieldValue,
    (fields: Data) => {
      view.update(fields);
    },
  ];
};
