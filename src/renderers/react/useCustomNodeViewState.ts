import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { CustomNodeView } from "../../nodeViews/CustomNodeView";
import type { CustomNodeViewSpec } from "../../types/Element";

export const useCustomNodeViewState = <Data extends unknown>({
  fieldSpec,
  nodeView,
}: CustomNodeViewSpec<Data>): [
  Data,
  MutableRefObject<((fields: Data) => void) | undefined>
] => {
  const [imageFields, setImageFields] = useState(fieldSpec.defaultValue);

  const updateRef = useRef<(fields: Data) => void>();

  useEffect(() => {
    if (!(nodeView instanceof CustomNodeView)) {
      console.error(
        `[prosemirror-elements]: An CustomNodeView component was passed a nodeView that wasn't a CustomNodeView. Instead it got a ${typeof nodeView}`
      );
      return;
    }
    updateRef.current = nodeView.subscribe(setImageFields);

    return () => nodeView.unsubscribe(setImageFields);
  }, []);

  return [imageFields, updateRef];
};
