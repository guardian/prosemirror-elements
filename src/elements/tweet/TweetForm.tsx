import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { EmbedTestId } from "../embed/EmbedForm";
import { Preview } from "../helpers/Preview";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import type { StandardElementOptions } from "../standard/StandardSpec";
import { createTweetFields } from "./TweetSpec";

export const createTweetElement = ({
  checkThirdPartyTracking,
  createCaptionPlugins,
}: StandardElementOptions) =>
  createReactElementSpec({
    fieldDescriptions: createTweetFields(createCaptionPlugins),
    consumer: ({ fields }) => (
      <div>
        <FieldLayoutVertical data-cy={EmbedTestId}>
          <Preview html={fields.html.value} />
          <CustomDropdownView field={fields.role} label="Weighting" />
          <CustomCheckboxView
            field={fields.isMandatory}
            label="This element is required for publication"
          />
          <TrackingStatusChecks
            html={fields.html.value}
            isMandatory={fields.isMandatory.value}
            checkThirdPartyTracking={checkThirdPartyTracking}
          />
        </FieldLayoutVertical>
      </div>
    ),
  });
