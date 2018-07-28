import TFields from './types/Fields';
import { TCommands } from './types/Commands';

type TState = {
  fields: TFields;
  commands: TCommands;
};

type TSubscriber = (state: TState, rebuild: boolean) => void;

const createStore = (fields: TFields, commands: TCommands) => {
  let subscribers: TSubscriber[] = [];

  let state = {
    fields,
    commands
  };

  return {
    subscribe: (fn: TSubscriber): void => {
      subscribers.push(fn);
    },
    rebuild: (newState: TState): void => {
      state = newState;
      subscribers.forEach(fn => fn(state, true));
    },
    update: (fields: TFields): void => {
      state = {
        ...state,
        fields: {
          ...state.fields,
          ...fields
        }
      };
      subscribers.forEach(fn => fn(state, false));
    },
    runSubscribers: (rebuild: boolean = false) =>
      subscribers.forEach(fn => fn(state, rebuild)),
    getState: () => state
  };
};

export { TState };

export default createStore;
