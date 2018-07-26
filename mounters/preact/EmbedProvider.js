import { h, Component } from 'preact';
import EmbedWrapper from './EmbedWrapper';

class EmbedProvider extends Component {
  constructor(props) {
    super(props);

    this.updateState = this.updateState.bind(this);

    this.state = {
      commands: this.props.commands,
      fields: this.props.fields
    };
  }

  componentDidMount() {
    this.props.updater.subscribe((fields, commands) =>
      this.setState(
        {
          commands,
          fields
        },
        false
      )
    );
    this.onStateChange();
  }

  onStateChange() {
    this.props.onStateChange(
      this.state.fields,
      this.props.validate(this.state.fields)
    );
  }

  setState(state, notifyListeners = true) {
    super.setState(state, () => notifyListeners && this.onStateChange());
  }

  updateState(fields = {}) {
    this.setState({
      fields: {
        ...this.state.fields,
        ...fields
      }
    });
  }

  render() {
    return (
      <EmbedWrapper name="Image" {...this.state.commands}>
        {this.props.children[0](
          this.state.fields,
          this.props.validate(this.state.fields),
          this.updateState
        )}
      </EmbedWrapper>
    );
  }
}

export default EmbedProvider;
