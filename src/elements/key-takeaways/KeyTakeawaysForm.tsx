import { DemoFieldWrapper } from "../../editorial-source-components/DemoFieldWrapper";
import { createReactAltStylesElementSpec } from "../alt-style/AltStyleElementForm";
import { keyTakeawaysFields } from "./KeyTakeawaysSpec";

export const keyTakeawaysElement = createReactAltStylesElementSpec(
  keyTakeawaysFields,
  (fields) => fields.repeater,
  (repeaterChild) => (
    <>
      <DemoFieldWrapper
        field={repeaterChild.title}
        showHeading={false}
        useAlternateStyles={true}
      />
      <DemoFieldWrapper
        field={repeaterChild.content}
        showHeading={false}
        useAlternateStyles={true}
      />
    </>
  )
);
