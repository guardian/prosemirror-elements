import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { DemoFieldWrapper } from "../../editorial-source-components/DemoFieldWrapper";
import { Link } from "../../editorial-source-components/Link";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import type { MainInteractiveProps } from "./InteractiveSpec";
import { createInteractiveFields } from "./InteractiveSpec";

export const InteractiveElementTestId = "InteractiveElement";

export const createInteractiveElement = (props: MainInteractiveProps) =>
  createReactElementSpec({
    fieldDescriptions: createInteractiveFields(props),
    component: ({ fields }) => (
      <FieldLayoutVertical data-cy={InteractiveElementTestId}>
        <Preview
          headingLabel="Interactive"
          headingContent={
            <span>
              &nbsp;
              <Link
                target="_blank"
                rel="noopener"
                href={fields.originalUrl.value}
              >
                (original url ↪)
              </Link>
            </span>
          }
          html={fields.html.value}
          iframeUrl={fields.iframeUrl.value}
        />
        <CustomDropdownView field={fields.role} label="Weighting" />
        <DemoFieldWrapper field={fields.alt} headingLabel="Alt text" />
        <DemoFieldWrapper field={fields.caption} headingLabel="Caption" />
        <CustomCheckboxView
          field={fields.isMandatory}
          label="This element is required for publication"
        />
        <TrackingStatusChecks
          html={fields.html.value}
          isMandatory={fields.isMandatory.value}
          checkThirdPartyTracking={props.checkThirdPartyTracking}
        />
      </FieldLayoutVertical>
    ),
  });
