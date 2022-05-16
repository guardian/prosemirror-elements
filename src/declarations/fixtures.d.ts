// Because these fixtures are large, inference slows down the typechecking considerably.
// We declare these types explicitly to avoid Typescript inferring types.
declare module "*.fixture.json" {
  const content: Array<{
    element: {
      assets: unknown[];
      fields: Record<string, unknown>;
    };
    created: string;
    contentid: string;
  }>;
  // eslint-disable-next-line import/no-default-export -- necessary for JSON import
  export default content;
}
