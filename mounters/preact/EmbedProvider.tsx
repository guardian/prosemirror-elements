import { h, Component, VNode } from 'preact';
import EmbedWrapper from './EmbedWrapper';
import TFields from '../../types/Fields';
import TErrors from '../../types/Errors';
import { TCommands } from '../../types/Commands';
import Consumer from '../../types/Consumer';
import TValidator from '../../types/Validator';

const fieldErrors = (fields: TFields, errors: TErrors | null) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: (errors || {})[key] || []
    }),
    {}
  );

type IProps = {
  subscribe: (fn: (fields: TFields) => void) => void;
  commands: TCommands;
  fields: TFields;
  onStateChange: (fields: TFields) => void;
  validate: TValidator<TFields>;
  consumer: Consumer<VNode, TFields>;
};

type IState = TFields;

class EmbedProvider extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = this.props.fields;
  }

  componentDidMount() {
    this.props.subscribe((fields = {}) => this.updateState(fields, false));
  }

  private onStateChange() {
    console.log('onStateChange', this.state.fields);
    this.props.onStateChange(this.state);
  }

  private updateState(
    state: Pick<IState, string | number>,
    notifyListeners: boolean
  ) {
    this.setState(state, () => notifyListeners && this.onStateChange());
  }

  updateFields = (fields = {}) => this.updateState(fields, true);

  render() {
    return (
      <EmbedWrapper name="Image" {...this.props.commands}>
        {this.props.consumer(
          this.state,
          fieldErrors(this.state, this.props.validate(this.state)),
          this.updateFields
        )}
      </EmbedWrapper>
    );
  }
}

export default EmbedProvider;
