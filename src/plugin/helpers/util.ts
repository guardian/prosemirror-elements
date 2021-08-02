// Wait one microtask before executing the callback.
// See e.g. https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
export const waitOneMicroTask = (cb: () => void) => {
  void Promise.resolve().then(cb);
};
