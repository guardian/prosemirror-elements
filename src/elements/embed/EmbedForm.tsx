import React from "react";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/VerticalFieldLayout";
import type { FieldNameToField } from "../../plugin/types/Element";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import { EmbedRecommendation } from "./embedComponents/EmbedRecommendations";
import type { TwitterUrl, YoutubeUrl } from "./embedComponents/embedUtils";
import type { createEmbedFields } from "./EmbedSpec";

type Props = {
  fields: FieldNameToField<ReturnType<typeof createEmbedFields>>;
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
  convertYouTube: (src: YoutubeUrl) => void;
  convertTwitter: (src: TwitterUrl) => void;
};

export const EmbedTestId = "EmbedElement";

export const EmbedForm: React.FunctionComponent<Props> = ({
  fields,
  checkThirdPartyTracking,
  convertYouTube,
  convertTwitter,
}) => (
  <FieldLayoutVertical data-cy={EmbedTestId}>
    <EmbedRecommendation
      html={fields.html.value}
      convertTwitter={convertTwitter}
      convertYouTube={convertYouTube}
    />
    <Preview html={fields.html.value} />
    <CustomDropdownView field={fields.role} label="Weighting" />
    <FieldWrapper field={fields.url} headingLabel="Source URL" />
    <FieldWrapper field={fields.html} headingLabel="Embed code" />
    <FieldWrapper field={fields.caption} headingLabel="Caption" />
    <FieldWrapper field={fields.alt} headingLabel="Alt text" />
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
);
