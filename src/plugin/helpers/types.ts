// Make the keys on the given object optional. For example,
//  Optional<{ a: 1, b: 2 }, "a"> is equivalent to
//  { a?: 1, b: 2}
export type Optional<
  T extends Record<string, unknown>,
  K extends keyof T
> = Omit<T, K> & Partial<Pick<T, K>>;

// Get a union of all the keys that match the shape of the given object. For eaxmple,
//  KeysWithValsOfType<{ a: 1, b: 2, c: "string" }, number> is equivalent to
//  "a" | "b"
export type KeysWithValsOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P;
} &
  keyof T;
