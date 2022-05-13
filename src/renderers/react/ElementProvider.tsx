import type { ReactElement } from "react";
import React, { Component } from "react";
import type { SendTelemetryEvent } from "../../elements/helpers/types/TelemetryEvents";
import type { Validator } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Commands } from "../../plugin/types/Commands";
import type { Consumer, ConsumerOptions } from "../../plugin/types/Consumer";
import type {
  FieldDescriptions,
  FieldNameToField,
} from "../../plugin/types/Element";
import { ElementWrapper } from "./ElementWrapper";
import { TelemetryContext } from "./TelemetryContext";

type IProps<FDesc extends FieldDescriptions<string>> = {
  subscribe: (
    fn: (
      fields: FieldNameToField<FDesc>,
      commands: Commands,
      isSelected: boolean
    ) => void
  ) => void;
  commands: Commands;
  fields: FieldNameToField<FDesc>;
  onStateChange: (fields: FieldNameToValueMap<FDesc>) => void;
  validate: Validator<FDesc>;
  consumer: Consumer<ReactElement | null, FDesc>;
  sendTelemetryEvent: SendTelemetryEvent;
};

type IState<FDesc extends FieldDescriptions<string>> = {
  commands: Commands;
  fields: FieldNameToField<FDesc>;
  isSelected: boolean;
};
export class ElementProvider<
  FDesc extends FieldDescriptions<string>
> extends Component<IProps<FDesc>, IState<FDesc>> {
  public constructor(props: IProps<FDesc>) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

    this.state = {
      commands: this.props.commands,
      fields: this.props.fields,
      isSelected: false,
    };
  }

  public componentDidMount() {
    this.props.subscribe((fields, commands, isSelected) =>
      this.setState({
        commands,
        fields,
        isSelected,
      })
    );
  }

  private updateFields(fields: FieldNameToValueMap<FDesc>): void {
    this.props.onStateChange(fields);
  }

  public render() {
    return (
      <TelemetryContext.Provider value={this.props.sendTelemetryEvent}>
        <ElementWrapper
          {...this.state.commands}
          isSelected={this.state.isSelected}
        >
          <this.Element
            fields={this.state.fields}
            updateFields={this.updateFields}
          />
        </ElementWrapper>
      </TelemetryContext.Provider>
    );
  }

  /**
   * This element is memoised to prevent rerenders when our fields have not changed.
   */
  private Element = React.memo<ConsumerOptions<FDesc>>(this.props.consumer);
}
