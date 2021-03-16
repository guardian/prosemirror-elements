import React, { Component, ReactElement } from 'react';
import EmbedWrapper from './EmbedWrapper';
import TFields from '../../types/Fields';
import TErrors from '../../types/Errors';
import { TCommands } from '../../types/Commands';
import TValidator from '../../types/Validator';
import { CreateReactEmbed } from './mount';

const fieldErrors = (fields: TFields, errors: TErrors | null) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: (errors || {})[key] || []
    }),
    {}
  );

type IProps = {
  subscribe: (fn: (fields: TFields, commands: TCommands) => void) => void;
  commands: TCommands;
  fields: TFields;
  onStateChange: (fields: TFields) => void;
  validate: TValidator<TFields>;
  createEmbed: CreateReactEmbed<TFields>;
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
  }

  onStateChange() {
    console.log('onStateChange', this.state.fields);
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
        {this.props.createEmbed(
          this.state.fields,
          fieldErrors(
            this.state.fields,
            this.props.validate(this.state.fields)
          ),
          this.updateFields
        )}
      </EmbedWrapper>
    );
  }
}

export default EmbedProvider;
