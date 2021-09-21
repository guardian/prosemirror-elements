import type { codeFields } from "../code/CodeElementSpec";
import type { embedFields } from "../embed/EmbedSpec";
import { transformElement as imageElementTransform } from "../image/imageElementDataTransformer";
import type { pullquoteFields } from "../pullquote/PullquoteSpec";
import { transformElement as defaultElementTransform } from "./defaultTransform";

const transformMap = {
  code: defaultElementTransform<typeof codeFields>(),
  embed: defaultElementTransform<typeof embedFields>(),
  image: imageElementTransform,
  pullquote: defaultElementTransform<typeof pullquoteFields>(),
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
