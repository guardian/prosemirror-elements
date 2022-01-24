import type { ReactElement } from "react";
import { useEffect, useState } from "react";

export const createStore = <Value>(defaultValue: Value) => {
  type Subscription = (val: Value) => void;

  const subscribers: Subscription[] = [];
  const store = {
    update: (val: Value) => subscribers.forEach((sub) => sub(val)),
    subscribe: (sub: Subscription) => subscribers.push(sub),
    unsubscribe: (sub: Subscription) => {
      const subToRemove = subscribers.findIndex(
        (currentSub) => currentSub === sub
      );
      subscribers.splice(subToRemove, 1);
    },
  };

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
