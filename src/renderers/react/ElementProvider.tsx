import type { ReactElement } from "react";
import React, { Component } from "react";
import type { SendTelemetryEvent } from "../../elements/helpers/types/TelemetryEvents";
import type { Validator } from "../../plugin/elementSpec";
import type { FieldNameToValueMap } from "../../plugin/helpers/fieldView";
import type { Commands, CommandState } from "../../plugin/types/Commands";
import type { Consumer, ConsumerOptions } from "../../plugin/types/Consumer";
import type {
  FieldDescriptions,
  FieldNameToField,
} from "../../plugin/types/Element";
import type { ElementWrapperProps } from "./ElementWrapper";
import { TelemetryContext } from "./TelemetryContext";

type IProps<FDesc extends FieldDescriptions<string>> = {
  subscribe: (
    fn: (
      fields: FieldNameToField<FDesc>,
      commandState: CommandState,
      isSelected: boolean
    ) => void
  ) => void;
  commands: Commands;
  commandState: CommandState;
  fields: FieldNameToField<FDesc>;
  onStateChange: (fields: FieldNameToValueMap<FDesc>) => void;
  validate: Validator<FDesc>;
  component: Consumer<ReactElement | null, FDesc>;
  sendTelemetryEvent: SendTelemetryEvent;
  onRemove?: () => void;
  wrapperComponent: React.FunctionComponent<ElementWrapperProps>;
};

type IState<FDesc extends FieldDescriptions<string>> = {
  commandState: CommandState;
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
      commandState: this.props.commandState,
      fields: this.props.fields,
      isSelected: false,
    };
  }

  public componentDidMount() {
    this.props.subscribe((fields, commandState, isSelected) =>
      this.setState({
        commandState,
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
        <this.props.wrapperComponent
          commands={this.props.commands}
          commandState={this.state.commandState}
          isSelected={this.state.isSelected}
          onRemove={this.props.onRemove}
        >
          <this.Element
            fields={this.state.fields}
            updateFields={this.updateFields}
          />
        </this.props.wrapperComponent>
      </TelemetryContext.Provider>
    );
  }

  /**
   * This element is memoised to prevent rerenders when our fields have not changed.
   */
  private Element = React.memo<ConsumerOptions<FDesc>>(this.props.component);
}
