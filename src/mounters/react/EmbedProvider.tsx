import type { ReactElement } from "react";
import React, { Component } from "react";
import type { TCommands } from "../../types/Commands";
import type { TConsumer } from "../../types/Consumer";
import type { ElementProps, NodeViewPropMapFromProps } from "../../types/Embed";
import type { TErrors } from "../../types/Errors";
import type { TFields } from "../../types/Fields";
import type { TValidator } from "../../types/Validator";
import { EmbedWrapper } from "./EmbedWrapper";

const fieldErrors = (fields: TFields, errors: TErrors | null) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: errors ? errors[key] : [],
    }),
    {}
  );

type IProps<Props extends ElementProps> = {
  subscribe: (fn: (fields: TFields, commands: TCommands) => void) => void;
  commands: TCommands;
  fields: TFields;
  onStateChange: (fields: TFields) => void;
  validate: TValidator;
  consumer: TConsumer<ReactElement, Props>;
  nestedEditors: NodeViewPropMapFromProps<Props>;
};

type IState = {
  commands: TCommands;
  fields: TFields;
};

export class EmbedProvider<Props extends ElementProps> extends Component<
  IProps<Props>,
  IState
> {
  constructor(props: IProps<Props>) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

    this.state = {
      commands: this.props.commands,
      fields: this.props.fields,
    };
  }

  componentDidMount() {
    this.props.subscribe((fields, commands) =>
      this.updateState(
        {
          commands,
          fields: {
            ...this.state.fields,
            ...fields,
          },
        },
        false
      )
    );
  }

  onStateChange(): void {
    this.props.onStateChange(this.state.fields);
  }

  updateState(state: Partial<IState>, notifyListeners: boolean): void {
    this.setState(
      { ...this.state, ...state },
      () => notifyListeners && this.onStateChange()
    );
  }

  updateFields(fields = {}): void {
    this.updateState(
      {
        fields: {
          ...this.state.fields,
          ...fields,
        },
      },
      true
    );
  }

  render() {
    return (
      <EmbedWrapper name="Image" {...this.state.commands}>
        {this.props.consumer(
          this.state.fields,
          fieldErrors(
            this.state.fields,
            this.props.validate(this.state.fields)
          ),
          this.updateFields,
          this.props.nestedEditors
        )}
      </EmbedWrapper>
    );
  }
}
