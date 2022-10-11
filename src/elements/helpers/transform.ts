import { transformElement as calloutElementTransform } from "../callout/calloutDataTransformer";
import type { codeFields } from "../code/CodeElementSpec";
import type { commentFields } from "../comment/CommentSpec";
import type { contentAtomFields } from "../content-atom/ContentAtomSpec";
import { transformElement as deprecatedElementTransform } from "../deprecated/deprecatedTransformer";
import { transformElement as embedElementTransform } from "../embed/embedDataTransformer";
import { transformElement as imageElementTransform } from "../image/imageElementDataTransformer";
import { transformElement as interactiveElementTransform } from "../interactive/interactiveDataTransformer";
import { transformElement as membershipElementTransform } from "../membership/membershipDataTransformer";
import type { pullquoteFields } from "../pullquote/PullquoteSpec";
import type { richlinkFields } from "../rich-link/RichlinkSpec";
import { transformElement as standardElementTransform } from "../standard/standardDataTransformer";
import type { tableFields } from "../table/TableSpec";
import type { createTweetFields } from "../tweet/TweetSpec";
import { transformElement as defaultElementTransform } from "./defaultTransform";

// A placeholder value for a dropdown option that represents no selection.
export const undefinedDropdownValue = "none-selected";

const transformMap = {
  code: defaultElementTransform<typeof codeFields>(),
  "content-atom": defaultElementTransform<typeof contentAtomFields>({
    isMandatory: true,
    transformRole: true,
  }),
  embed: embedElementTransform,
  callout: calloutElementTransform,
  image: imageElementTransform,
  interactive: interactiveElementTransform,
  pullquote: defaultElementTransform<typeof pullquoteFields>(),
  "rich-link": defaultElementTransform<typeof richlinkFields>({
    isMandatory: true,
  }),
  video: standardElementTransform,
  audio: standardElementTransform,
  document: standardElementTransform,
  map: standardElementTransform,
  membership: membershipElementTransform,
  table: defaultElementTransform<typeof tableFields>({
    isMandatory: true,
    transformRole: true,
  }),
  vine: deprecatedElementTransform,
  instagram: deprecatedElementTransform,
  witness: deprecatedElementTransform,
  tweet: defaultElementTransform<ReturnType<typeof createTweetFields>>({
    isMandatory: true,
    transformRole: true,
  }),
  comment: defaultElementTransform<typeof commentFields>({
    isMandatory: true,
    transformRole: true,
  }),
  form: deprecatedElementTransform,
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
