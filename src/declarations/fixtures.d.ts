// Because these fixtures are large, inference slows down the typechecking considerably.
// We declare these types explicitly to avoid Typescript inferring types.
declare module "*.fixture.json" {
  const content: Array<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- our element is used for fixture tests, so the type is arbitrary
    element: any;
    created: string;
    contentid: string;
  }>;
  // eslint-disable-next-line import/no-default-export -- necessary for JSON import
  export default content;
}
