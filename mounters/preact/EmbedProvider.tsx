import { h, Component } from 'preact';
import EmbedWrapper from './EmbedWrapper';

class EmbedProvider extends Component {
  constructor(props) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

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
  }

  setState(state, notifyListeners = true) {
    super.setState(
      state,
      () =>
        notifyListeners &&
        this.props.onStateChange(this.state.fields /*  errors here */)
    );
  }

  updateFields(fields = {}) {
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
        {this.props.children[0](this.state.fields, this.updateFields)}
      </EmbedWrapper>
    );
  }
}

export default EmbedProvider;
