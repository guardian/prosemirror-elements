import type { ReactElement } from "react";
import React, { Component } from "react";
import type {
  FieldValidationErrors,
  Validator,
} from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Commands } from "../../plugin/types/Commands";
import type { Consumer, ConsumerOptions } from "../../plugin/types/Consumer";
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
  public constructor(props: IProps<FDesc>) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

    this.state = {
      commands: this.props.commands,
      fieldValues: this.props.fieldValues,
    };
  }

  public componentDidMount() {
    this.props.subscribe((fieldValues, commands) =>
      this.updateState(
        {
          commands,
          fieldValues,
        },
        false
      )
    );
  }

  public onStateChange(): void {
    this.props.onStateChange(this.state.fieldValues);
  }

  private updateState(
    newState: Partial<IState<FDesc>>,
    notifyListeners: boolean
  ): void {
    this.setState(
      { ...this.state, ...newState },
      () => notifyListeners && this.onStateChange()
    );
  }

  private updateFields(fieldValues: FieldNameToValueMap<FDesc>): void {
    this.updateState(
      {
        fieldValues,
      },
      true
    );
  }

  public render() {
    return (
      <ElementWrapper {...this.state.commands}>
        <this.Element
          fields={this.props.fields}
          fieldValues={this.state.fieldValues}
          updateFields={this.updateFields}
        />
      </ElementWrapper>
    );
  }

  /**
   * This element is memoised to prevent rerenders when our fieldValues have not changed.
   */
  private Element = React.memo<Omit<ConsumerOptions<FDesc>, "errors">>(
    (options) => {
      const errors = fieldErrors(
        this.state.fieldValues,
        this.props.validate(this.state.fieldValues)
      );
      return this.props.consumer({ ...options, errors });
    }
  );
}
