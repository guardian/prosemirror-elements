const createUpdater = () => {
  let sub = () => {};
  return {
    subscribe: fn => {
      sub = fn;
    },
    update: (...args) => sub(...args)
  };
};

const mount = render => consumer => (dom, updateFields, fields, commands) => {
  const updater = createUpdater();
  render(consumer, dom, updateFields, fields, commands, updater);
  return updater.update;
};

export default mount;
