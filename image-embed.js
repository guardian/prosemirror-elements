import { h, render, Component } from 'preact';
import EmbedWrapper from './EmbedWrapper';

class ImageEmbed extends Component {
  constructor(props) {
    super(props);

    this.handleNameChange = this.handleNameChange.bind(this);

    this.state = {
      commands: this.props.commands,
      fields: this.props.fields
    };
  }

  componentDidMount() {
    this.props.updater.subscribe(state => this.setState(state, false));
  }

  setState(state, notifyListeners = true) {
    super.setState(
      state,
      () =>
        notifyListeners &&
        this.props.onStateChange(this.state.fields /*  errors here */)
    );
  }

  handleNameChange(e) {
    this.setState({
      fields: {
        ...this.state.fields,
        name: e.target.value
      }
    });
  }

  render() {
    return (
      <EmbedWrapper name="Image" {...this.state.commands}>
        <input
          type="text"
          value={this.state.fields.name}
          onInput={this.handleNameChange}
        />
      </EmbedWrapper>
    );
  }
}

const mount = () => (dom, updateFields, fields, commands) => {
  const createUpdater = () => {
    let sub = () => {};
    return {
      subscribe: fn => {
        sub = fn;
      },
      update: (...args) => sub(...args)
    };
  };
  const updater = createUpdater();
  render(
    <ImageEmbed
      onStateChange={updateFields}
      fields={fields}
      updater={updater}
      commands={commands}
    />,
    dom
  );
  return updater.update;
};

export default mount;
