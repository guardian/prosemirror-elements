export type Optional<
  T extends Record<string, unknown>,
  K extends keyof T
> = Omit<T, K> & Partial<Pick<T, K>>;

export type KeysWithValsOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P;
} &
  keyof T;
