const createUpdater = () => {
  let sub = () => {};
  return {
    subscribe: fn => {
      sub = fn;
    },
    update: (...args) => sub(...args)
  };
};

const mount = render => (consumer, validate) => (
  dom,
  updateFields,
  fields,
  commands
) => {
  const updater = createUpdater();
  render(
    consumer,
    validate,
    dom,
    fields =>
      // currently uses setTimeout to make sure the view is ready as this can
      // be called on view load
      // PR open https://github.com/ProseMirror/prosemirror-view/pull/34
      setTimeout(() => updateFields(fields, !!validate(fields))),
    fields,
    commands,
    updater
  );
  return updater.update;
};

export default mount;
