import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import React from "react";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { FieldWrapper } from "../../editorial-source-components/FieldWrapper";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { CustomCheckboxView } from "../../renderers/react/customFieldViewComponents/CustomCheckboxView";
import { CustomDropdownView } from "../../renderers/react/customFieldViewComponents/CustomDropdownView";
import { Preview } from "../helpers/Preview";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { TrackingStatusChecks } from "../helpers/ThirdPartyStatusChecks";
import { EmbedRecommendation } from "./embedComponents/EmbedRecommendations";
import type { TwitterUrl, YoutubeUrl } from "./embedComponents/embedUtils";
import { createEmbedFields } from "./EmbedSpec";

export type MainEmbedOptions = {
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
  convertYouTube: (src: YoutubeUrl) => void;
  convertTwitter: (src: TwitterUrl) => void;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
  targetingUrl: string;
};

export const EmbedTestId = "EmbedElement";

export const createEmbedElement = (options: MainEmbedOptions) =>
  createReactElementSpec({
    fieldDescriptions: createEmbedFields(options),
    consumer: ({ fields }) => (
      <FieldLayoutVertical data-cy={EmbedTestId}>
        <EmbedRecommendation
          html={fields.html.value}
          convertTwitter={options.convertTwitter}
          convertYouTube={options.convertYouTube}
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
          checkThirdPartyTracking={options.checkThirdPartyTracking}
        />
      </FieldLayoutVertical>
    ),
  });
