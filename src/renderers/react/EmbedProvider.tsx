import type { ReactElement } from "react";
import React, { Component } from "react";
import type { Validator } from "../../embedSpec";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import type { TCommands } from "../../types/Commands";
import type { Consumer } from "../../types/Consumer";
import type { FieldNameToNodeViewSpec, FieldSpec } from "../../types/Embed";
import type { TErrors } from "../../types/Errors";
import { EmbedWrapper } from "./EmbedWrapper";

const fieldErrors = <FSpec extends FieldSpec<string>>(
  fields: FieldNameToValueMap<FSpec>,
  errors: TErrors | null
) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: errors?.[key] ? errors[key] : [],
    }),
    {}
  );

type IProps<FSpec extends FieldSpec<string>> = {
  subscribe: (
    fn: (fields: FieldNameToValueMap<FSpec>, commands: TCommands) => void
  ) => void;
  commands: TCommands;
  fieldValues: FieldNameToValueMap<FSpec>;
  onStateChange: (fields: FieldNameToValueMap<FSpec>) => void;
  validate: Validator<FSpec>;
  consumer: Consumer<ReactElement, FSpec>;
  fields: FieldNameToNodeViewSpec<FSpec>;
};

type IState<FSpec extends FieldSpec<string>> = {
  commands: TCommands;
  fieldValues: FieldNameToValueMap<FSpec>;
};

export class EmbedProvider<FSpec extends FieldSpec<string>> extends Component<
  IProps<FSpec>,
  IState<FSpec>
> {
  constructor(props: IProps<FSpec>) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

    this.state = {
      commands: this.props.commands,
      fieldValues: this.props.fieldValues,
    };
  }

  componentDidMount() {
    this.props.subscribe((fields, commands) =>
      this.updateState(
        {
          commands,
          fieldValues: {
            ...this.state.fieldValues,
            ...fields,
          },
        },
        false
      )
    );
  }

  onStateChange(): void {
    this.props.onStateChange(this.state.fieldValues);
  }

  updateState(state: Partial<IState<FSpec>>, notifyListeners: boolean): void {
    this.setState(
      { ...this.state, ...state },
      () => notifyListeners && this.onStateChange()
    );
  }

  updateFields(fieldValues = {}): void {
    this.updateState(
      {
        fieldValues: {
          ...this.state.fieldValues,
          ...fieldValues,
        },
      },
      true
    );
  }

  render() {
    const errors = fieldErrors(
      this.state.fieldValues,
      this.props.validate(this.state.fieldValues)
    );
    return (
      <EmbedWrapper name="Image" {...this.state.commands}>
        {this.props.consumer(
          this.state.fieldValues,
          errors,
          this.updateFields,
          this.props.fields
        )}
      </EmbedWrapper>
    );
  }
}
