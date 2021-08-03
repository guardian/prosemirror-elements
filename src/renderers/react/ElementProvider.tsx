import type { ReactElement } from "react";
import React, { Component } from "react";
import type { Validator } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { Commands } from "../../plugin/types/Commands";
import type { Consumer } from "../../plugin/types/Consumer";
import type {
  FieldNameToFieldViewSpec,
  FieldSpec,
} from "../../plugin/types/Element";
import type { Errors } from "../../plugin/types/Errors";
import { ElementWrapper } from "./ElementWrapper";

const fieldErrors = <FSpec extends FieldSpec<string>>(
  fields: FieldNameToValueMap<FSpec>,
  errors: Errors | null
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
    fn: (fields: FieldNameToValueMap<FSpec>, commands: Commands) => void
  ) => void;
  commands: Commands;
  fieldValues: FieldNameToValueMap<FSpec>;
  onStateChange: (fields: FieldNameToValueMap<FSpec>) => void;
  validate: Validator<FSpec>;
  consumer: Consumer<ReactElement, FSpec>;
  fields: FieldNameToFieldViewSpec<FSpec>;
  name: string;
};

type IState<FSpec extends FieldSpec<string>> = {
  commands: Commands;
  fieldValues: FieldNameToValueMap<FSpec>;
};

export class ElementProvider<FSpec extends FieldSpec<string>> extends Component<
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
      <ElementWrapper name="Element" {...this.state.commands}>
        {this.props.consumer(
          this.state.fieldValues,
          errors,
          this.updateFields,
          this.props.fields
        )}
      </ElementWrapper>
    );
  }
}
