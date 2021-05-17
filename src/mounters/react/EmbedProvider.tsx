import type { ReactElement } from "react";
import React, { Component } from "react";
import type { Validator } from "../../mount";
import type { NodeViewPropValues } from "../../nodeViews/helpers";
import type { TCommands } from "../../types/Commands";
import type { TConsumer } from "../../types/Consumer";
import type { EmbedProps, NodeViewPropMap } from "../../types/Embed";
import type { TErrors } from "../../types/Errors";
import { EmbedWrapper } from "./EmbedWrapper";

const fieldErrors = <Props extends EmbedProps<string>>(
  fields: NodeViewPropValues<Props>,
  errors: TErrors | null
) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: errors ? errors[key] : [],
    }),
    {}
  );

type IProps<Props extends EmbedProps<string>> = {
  subscribe: (
    fn: (fields: NodeViewPropValues<Props>, commands: TCommands) => void
  ) => void;
  commands: TCommands;
  fields: NodeViewPropValues<Props>;
  onStateChange: (fields: NodeViewPropValues<Props>) => void;
  validate: Validator<Props>;
  consumer: TConsumer<ReactElement, Props>;
  nestedEditors: NodeViewPropMap<Props>;
};

type IState<Props extends EmbedProps<string>> = {
  commands: TCommands;
  fields: NodeViewPropValues<Props>;
};

export class EmbedProvider<Props extends EmbedProps<string>> extends Component<
  IProps<Props>,
  IState<Props>
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

  updateState(state: Partial<IState<Props>>, notifyListeners: boolean): void {
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
