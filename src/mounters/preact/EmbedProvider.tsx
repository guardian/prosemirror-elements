import { h, Component, VNode } from 'preact';
import EmbedWrapper from './EmbedWrapper';
import TFields from '../../types/Fields';
import { TCommands } from '../../types/Commands';
import Consumer from '../../types/Consumer';

type IProps = {
  subscribe: (fn: (fields: TFields, commands: TCommands) => void) => void;
  commands: TCommands;
  fields: TFields;
  onStateChange: (fields: TFields) => void;
  consume: (fields: TFields, updateFields: (fields: TFields) => void) => void;
};

type IState = {
  commands: TCommands;
  fields: TFields;
};

class EmbedProvider extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

    this.state = {
      commands: this.props.commands,
      fields: this.props.fields
    };
  }

  componentDidMount() {
    this.props.subscribe((fields = {}, commands) =>
      this.updateState(
        {
          commands,
          fields: {
            ...this.state.fields,
            ...fields
          }
        },
        false
      )
    );
    this.onStateChange();
  }

  onStateChange() {
    this.props.onStateChange(this.state.fields);
  }

  updateState(state: Partial<IState>, notifyListeners: boolean) {
    this.setState(
      { ...this.state, ...state },
      () => notifyListeners && this.onStateChange()
    );
  }

  updateFields(fields = {}) {
    this.updateState(
      {
        fields: {
          ...this.state.fields,
          ...fields
        }
      },
      true
    );
  }

  render() {
    return (
      <EmbedWrapper name="Image" {...this.state.commands}>
        {this.props.consume(this.state.fields, this.updateFields)}
      </EmbedWrapper>
    );
  }
}

export default EmbedProvider;
