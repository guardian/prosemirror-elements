import React from "react";
import type { SendTelemetryEvent } from "../../elements/helpers/types/TelemetryEvents";

export const TelemetryContext = React.createContext<
  SendTelemetryEvent | undefined
>(undefined);
