// Wait one microtask before executing the callback.

import uniqueId from "lodash/uniqueId";

// See e.g. https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
export const waitOneMicroTask = (cb: () => void) => {
  void Promise.resolve().then(cb);
};

export const waitForNextLayout = () =>
  new Promise((res) => requestAnimationFrame(() => setTimeout(res)));

export const getRepeaterID = () => uniqueId;
