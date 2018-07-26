const createUpdater = () => {
  let sub: (...args: any[]) => void = () => {};
  return {
    subscribe: (fn: (...args: any[]) => void) => {
      sub = fn;
    },
    update: (...args: any[]) => sub(...args)
  };
};

const mount = render => consumer => (dom, updateFields, fields, commands) => {
  const updater = createUpdater();
  render(consumer, dom, updateFields, fields, commands, updater);
  return updater.update;
};

export default mount;
