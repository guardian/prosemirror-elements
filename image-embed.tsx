import { h, render, Component } from 'preact';
import EmbedWrapper from './EmbedWrapper';

interface IFields {
  [s: string]: any
}

interface IProps {
  fields: IFields
  updater: {
    subscribe: (fields: any) => void
  }
  onStateChange: (fields: IFields) =>  void
}

interface IState {
  fields: IFields
}

class ImageEmbed extends Component<IProps, IState> {
  state = {
    fields: this.props.fields
  }

  constructor(props: IProps) {
    super(props);

    this.handleNameChange = this.handleNameChange.bind(this);
  }

  public componentDidMount() {
    this.props.updater.subscribe((fields: IFields) =>
      this.setState(
        {
          fields
        },
        undefined,
        false
      )
    );
  }

  public setState(state: IState, cb?: () => void, notifyListeners = true) {
    super.setState(
      state,
      () =>
        notifyListeners &&
        this.props.onStateChange(this.state.fields /*  errors here */)
    );
  }

  public render() {
    return (
      <EmbedWrapper name="Image" {...this.props}>
        <input
          type="text"
          value={this.state.fields.name}
          onInput={this.handleNameChange}
        />
      </EmbedWrapper>
    );
  }

  private handleNameChange(e: Event) {
    this.setState({
      fields: {
        ...this.state.fields,
        name: e.target instanceof HTMLInputElement ? e.target.value : ''
      }
    });
  }
}

const mount = () => (dom: HTMLElement, updateFields: ({ fields }: { fields: IFields }) => void, fields: IFields, remove: () => void) => {
  const createUpdater = () => {
    let sub = (fields: IFields) => {};
    return {
      subscribe: (fn: (fields: IFields) => void) => {
        sub = fn;
      },
      setFields: (fields: IFields) => sub(fields)
    };
  };
  const updater = createUpdater();
  render(
    <ImageEmbed
      remove={remove}
      onStateChange={updateFields}
      fields={fields}
      updater={updater}
    />,
    dom
  );
  return updater.setFields;
};

export default mount;
