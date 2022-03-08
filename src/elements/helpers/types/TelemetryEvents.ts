import type { IUserTelemetryEvent } from "@guardian/user-telemetry-client";

export enum CommandTelemetryType {
  PMEUpButtonPressed = "PME_UP_BUTTON_PRESSED",
  PMEDownButtonPressed = "PME_DOWN_BUTTON_PRESSED",
  PMERemoveButtonPressed = "PME_REMOVE_BUTTON_PRESSED",
  PMESelectButtonPressed = "PME_SELECT_BUTTON_PRESSED",
}

export type SendTelemetryEvent =
  | undefined
  | ((type: string, tags?: IUserTelemetryEvent["tags"]) => void);
