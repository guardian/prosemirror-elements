import type { ReactElement } from "react";
import { useEffect, useState } from "react";

/**
 * Creates a store to allow state within React to be programmatically updated
 * outside of a React context.
 */
export const createStore = <Value>(defaultValue: Value) => {
  type Subscription = (val: Value) => void;

  const subscribers: Subscription[] = [];

  const store = {
    /**
     * Update the value in the store, informing subscribers.
     *
     * @return {boolean} true if there are any subscribers, false if not.
     */
    update: (val: Value): boolean => {
      subscribers.forEach((sub) => sub(val));
      return subscribers.length ? true : false;
    },

    /**
     * Subscribe to store updates.
     */
    subscribe: (sub: Subscription) => subscribers.push(sub),

    /**
     * Unsubscribe to store updates.
     */
    unsubscribe: (sub: Subscription) => {
      const subToRemove = subscribers.findIndex(
        (currentSub) => currentSub === sub
      );
      subscribers.splice(subToRemove, 1);
    },
  };

  /**
   * The Store component takes a single function as a child component, and calls it
   * with the store value. It will call this function every time the store value is
   * updated, rerendering its children.
   *
   * Example usage:
   *
   * ```tsx
   * <Store>
   *   {(value) =>
   *      <div>{value}</div>
   *   }
   * </Store>
   * ```
   */
  const Store = ({ children }: { children: (val: Value) => ReactElement }) => {
    const [value, setValue] = useState(defaultValue);
    useEffect(() => {
      store.subscribe(setValue);
      return () => store.unsubscribe(setValue);
    }, []);

    return children(value);
  };

  return { update: store.update, Store };
};

export type Store<Value> = (props: {
  children: (val: Value) => ReactElement;
}) => ReactElement;
