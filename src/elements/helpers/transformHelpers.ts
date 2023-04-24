import type { Asset } from "./defaultTransform";

export const moveAssetsAndFieldsInline = <
  ExternalData extends {
    assets: Asset[];
    fields: Record<string, unknown>;
  }
>() => {
  const inFn = ({
    assets,
    fields,
  }: ExternalData): { assets: Asset[] } & ExternalData["fields"] => ({
    assets,
    ...fields,
  });

  const outFn = ({
    assets,
    ...fields
  }: ReturnType<typeof inFn>): {
    assets: Asset[];
    fields: ExternalData["fields"];
  } => ({
    assets,
    fields: (fields as unknown) as ExternalData["fields"],
  });

  return { in: inFn, out: outFn };
};

export const stringToBool = <T extends string>(key: T) => {
  const inFn = <Fields extends { [key in T]: string }>(
    fields: Fields
  ): Omit<Fields, T> & Record<T, boolean> => ({
    ...fields,
    [key]: fields[key] === "true",
  });

  const outFn = <Fields extends { [key in T]: boolean }>(
    fields: Fields
  ): Omit<Fields, T> & { [key in T]: string } => ({
    ...fields,
    [key]: fields[key] === true ? "true" : "false",
  });

  return { in: inFn, out: outFn };
};

/**
 * A convenience method for "piping" a value through a series of functions,
 * creating a "pipeline" of code. It is equivalent to a series of nested
 * function calls, but without the need for so many brackets, and with the
 * function names appearing in the order that they will be called. See the
 * example for more details.
 *
 * It's variadic, meaning that it takes a variable number of arguments. In this
 * case it means it can take one or more functions to "pipe" the value through.
 *
 * @param a A value to pass to the first function
 * @param f The first function to pass the value to
 * @param g The second function, which takes the result of the first, `f`
 * @param h The third function, which takes the result of the second, `g`
 * @example
 * const addThree = (n: number): number => n + 3
 * const subTwo = (n: number): number => n - 2
 * const multFour = (n: number): number => n * 4
 *
 * const num = 42
 *
 * // The function names are written in the opposite order to the one they're
 * // called in: <-
 * const resultOne = multFour(subTwo(addThree(num)));
 *
 * // The function names are written in the order in which they're called: ->,
 * // and the enclosing brackets are not required
 * const resultTwo = pipe(
 *     num,
 *     addThree,
 *     subTwo,
 *     multFour,
 * );
 */
export function pipe<A, B>(a: A, f: (_a: A) => B): B;
export function pipe<A, B, C>(a: A, f: (_a: A) => B, g: (_b: B) => C): C;
export function pipe<A, B, C, D>(
  a: A,
  f: (_a: A) => B,
  g: (_b: B) => C,
  h: (_c: C) => D
): D;
export function pipe<A, B, C, D>(
  a: A,
  f: (_a: A) => B,
  g?: (_b: B) => C,
  h?: (_c: C) => D
): unknown {
  if (g !== undefined && h !== undefined) {
    return h(g(f(a)));
  } else if (g !== undefined) {
    return g(f(a));
  }

  return f(a);
}

type Transformer = { in: <A, B>(a: A) => B; out: <A, B>(a: A) => B };

export const createTransformer = <
  T extends [Head, ...Transformer[], Tail],
  Head extends Transformer,
  Tail extends Transformer
>(
  transformers: T[]
) => ({
  in: (
    externalElement: Parameters<Head["in"]>[0]
  ): ReturnType<Tail["out"]> => {},
  out: (
    externalElement: Parameters<Head["out"]>[0]
  ): ReturnType<Tail["in"]> => {},
});
