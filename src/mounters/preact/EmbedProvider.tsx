import { h, Component, VNode } from 'preact';
import TFields from '../../types/Fields';
import { TCommands } from '../../types/Commands';
import { TState } from '../../createStore';

type IProps = {
  initState: TState;
  subscribe: (fn: (state: TState) => void) => void;
  consume: (fields: TFields, commands: TCommands) => VNode;
};

type IState = {
  commands: TCommands;
  fields: TFields;
};

class EmbedProvider extends Component<IProps, TState> {
  constructor(props: IProps) {
    super(props);
    this.state = this.props.initState;
  }

  componentDidMount() {
    this.props.subscribe(state => this.setState(state));
  }

  render() {
    return this.props.consume(this.state.fields, this.state.commands);
  }
}

export default EmbedProvider;
