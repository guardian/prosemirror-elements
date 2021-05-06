import type { Schema } from "prosemirror-model";
import type { ReactElement } from "react";
import React, { Component } from "react";
import type { TCommands } from "../../types/Commands";
import type { TConsumer } from "../../types/Consumer";
import type { NestedEditorMap } from "../../types/Embed";
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

type IProps<FieldAttrs extends TFields> = {
  subscribe: (fn: (fields: FieldAttrs, commands: TCommands) => void) => void;
  commands: TCommands;
  fields: FieldAttrs;
  defaultFields: FieldAttrs;
  onStateChange: (fields: Partial<FieldAttrs>) => void;
  validate: TValidator<FieldAttrs>;
  consumer: TConsumer<ReactElement, FieldAttrs>;
  nestedEditors: NestedEditorMap;
};

type IState<FieldAttrs extends TFields> = {
  commands: TCommands;
  fields: FieldAttrs;
};

export class EmbedProvider<FieldAttrs extends TFields> extends Component<
  IProps<FieldAttrs>,
  IState<FieldAttrs>
> {
  constructor(props: IProps<FieldAttrs>) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

    this.state = {
      commands: this.props.commands,
      fields: this.props.fields,
    };
  }

  componentDidMount() {
    this.props.subscribe((fields = this.props.defaultFields, commands) =>
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

  updateState(
    state: Partial<IState<FieldAttrs>>,
    notifyListeners: boolean
  ): void {
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
