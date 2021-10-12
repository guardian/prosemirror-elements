import isEqual from "lodash/isEqual";
import type { ReactElement } from "react";
import React, { Component } from "react";
import type {
  FieldValidationErrors,
  Validator,
} from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Commands } from "../../plugin/types/Commands";
import type { Consumer } from "../../plugin/types/Consumer";
import type {
  FieldDescriptions,
  FieldNameToField,
} from "../../plugin/types/Element";
import { ElementWrapper } from "./ElementWrapper";

const fieldErrors = <FDesc extends FieldDescriptions<string>>(
  fields: FieldNameToValueMap<FDesc>,
  errors: FieldValidationErrors | undefined
) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: errors?.[key] ? errors[key] : [],
    }),
    {}
  );

type IProps<FDesc extends FieldDescriptions<string>> = {
  subscribe: (
    fn: (fields: FieldNameToValueMap<FDesc>, commands: Commands) => void
  ) => void;
  commands: Commands;
  fieldValues: FieldNameToValueMap<FDesc>;
  onStateChange: (fields: FieldNameToValueMap<FDesc>) => void;
  validate: Validator<FDesc>;
  consumer: Consumer<ReactElement, FDesc>;
  fields: FieldNameToField<FDesc>;
};

type IState<FDesc extends FieldDescriptions<string>> = {
  commands: Commands;
  fieldValues: FieldNameToValueMap<FDesc>;
};

export class ElementProvider<
  FDesc extends FieldDescriptions<string>
> extends Component<IProps<FDesc>, IState<FDesc>> {
  constructor(props: IProps<FDesc>) {
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

  updateState(state: Partial<IState<FDesc>>, notifyListeners: boolean): void {
    if (
      !isEqual(state.fieldValues, this.state.fieldValues) ||
      (state.commands && state.commands.pos != this.state.commands.pos)
    ) {
      this.setState(
        { ...this.state, ...state },
        () => notifyListeners && this.onStateChange()
      );
    }
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
      <ElementWrapper {...this.state.commands}>
        {this.props.consumer({
          fields: this.props.fields,
          errors,
          fieldValues: this.state.fieldValues,
          updateFields: this.updateFields,
        })}
      </ElementWrapper>
    );
  }
}
