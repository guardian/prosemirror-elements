import { transformElementDataIn } from "../image/ImageElementDataTransformer";

// const fakeTransform = (foo: string) => {
//   return {
//     bar: "",
//     foo,
//   };
// };

const transformInMap = {
  image: transformElementDataIn,
  //code: undefined,
  // blah: fakeTransform,
} as const;

type TransformInMap = typeof transformInMap;

export const transfromElementIn = <Name extends keyof TransformInMap>(
  elementName: Name,
  values: Parameters<TransformInMap[Name]>[0]
): ReturnType<TransformInMap[Name]> => {
  const transformer = transformInMap[elementName];

  const result = transformer((values as unknown) as any);
  return result as ReturnType<TransformInMap[Name]>;
};

// const foo = () => {
//   const codeValues = { html: "words" };

//   const result = transfromElementIn({ elementName: "code", values: codeValues });

//   return result;
// };

// const thing = foo();

// const bar = () => {
//   const imageValues = { abc: "words" };

//   const result = transfromElementIn("image", imageValues);

//   return result;
// };

// const thing2 = bar();

// const baz = () => {
//   return transfromElementIn("blah", "hello");
// };

// const thing3 = baz();

// : ExtractTransformReturnType<
//   TransformInMap[Name],
//   ExternalValues
// >
