import type { codeFields } from "../code/CodeElementSpec";
import { transformElement as embedElementTransform } from "../embed/embedDataTransformer";
import { transformElement as imageElementTransform } from "../image/imageElementDataTransformer";
import { transformElement as interactiveElementTransform } from "../interactive/interactiveDataTransformer";
import type { pullquoteFields } from "../pullquote/PullquoteSpec";
import type { richlinkFields } from "../rich-link/RichlinkSpec";
import { transformElement as videoElementTransform } from "../video/videoDataTransformer";
import { transformElement as defaultElementTransform } from "./defaultTransform";

// A placeholder value for a dropdown option that represents no selection.
export const undefinedDropdownValue = "none-selected";

const transformMap = {
  code: defaultElementTransform<typeof codeFields>(),
  embed: embedElementTransform,
  image: imageElementTransform,
  interactive: interactiveElementTransform,
  pullquote: defaultElementTransform<typeof pullquoteFields>(),
  "rich-link": defaultElementTransform<typeof richlinkFields>(true),
  video: videoElementTransform,
} as const;

type TransformMap = typeof transformMap;
type TransformMapIn<Name extends keyof TransformMap> = TransformMap[Name]["in"];
type TransformMapOut<
  Name extends keyof TransformMap
> = TransformMap[Name]["out"];

export const transformElementIn = <Name extends keyof TransformMap>(
  elementName: Name,
  values: Parameters<TransformMapIn<Name>>[0]
): ReturnType<TransformMapIn<Name>> | undefined => {
  const transformer = transformMap[elementName];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- This may be used in a JS context and be falst
  if (transformer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required due to typesafety complexity between transformer and params
    const result = transformer.in((values as unknown) as any);
    return result as ReturnType<TransformMapIn<Name>>;
  } else {
    return undefined;
  }
};

export const transformElementOut = <Name extends keyof TransformMap>(
  elementName: Name,
  values: Parameters<TransformMapOut<Name>>[0]
): ReturnType<TransformMapOut<Name>> | undefined => {
  const transformer = transformMap[elementName];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- This may be used in a JS context and be falst
  if (transformer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required due to typesafety complexity between transformer and params
    const result = transformer.out((values as unknown) as any);
    return result as ReturnType<TransformMapOut<Name>>;
  } else {
    return undefined;
  }
};
