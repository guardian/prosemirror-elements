import { transformElementDataIn } from "../image/ImageElementDataTransformer";

const transformInMap = {
  image: transformElementDataIn,
};

export const transfromElementIn = ({
  elementName,
  values,
}: {
  elementName: keyof typeof transformInMap;
  values: Parameters<typeof transformInMap[typeof elementName]>[0];
}) => {
  const transformer = transformInMap[elementName];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this may be falsy.
  if (transformer) {
    transformer(values);
  } else {
    return values;
  }
};
