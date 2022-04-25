import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { FormElementForm } from "./FormElementForm";

export type ExtraFormData = {
  iframeUrl?: string;
  scriptName?: string;
  source?: string;
  viewKey?: string;
  scriptUrl?: string;
  alt?: string;
};

export type FormData = {
  id?: string;
  signedOutAltText: string;
  html: string;
  originalUrl: string;
  isMandatory: boolean;
};

export type MainFormProps = {
  createCaptionPlugins?: (schema: Schema) => Plugin[];
  checkThirdPartyTracking: (html: string) => Promise<TrackingStatus>;
};

export const signedOutAltTextMaxLength = 1000;

export const createFormFields = ({ createCaptionPlugins }: MainFormProps) => ({
  signedOutAltText: createFlatRichTextField({
    createPlugins: createCaptionPlugins,
    marks: "em strong link strike",
    validators: [
      htmlRequired(undefined, "WARN"),
      htmlMaxLength(signedOutAltTextMaxLength, undefined, "WARN"),
    ],
    placeholder: "Text to show users if they aren't signed in",
  }),
  html: createTextField(),
  id: createTextField(),
  originalUrl: createTextField(),
  isMandatory: createCustomField(true, true),
  data: createCustomField("", undefined),
});

export const createFormElement = (formProps: MainFormProps) =>
  createReactElementSpec(
    createFormFields(formProps),
    ({ fields, fieldValues, errors }) => {
      return (
        <FormElementForm
          errors={errors}
          fields={fields}
          fieldValues={fieldValues}
          checkThirdPartyTracking={formProps.checkThirdPartyTracking}
        />
      );
    }
  );
