import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import { createCustomField } from "../../plugin/fieldViews/CustomFieldView";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength } from "../../plugin/helpers/validation";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import type { TrackingStatus } from "../helpers/ThirdPartyStatusChecks";
import { FormElementForm } from "./FormElementForm";

type FormData = {
  iframeUrl?: string;
  scriptName?: string;
  source?: string;
  viewKey?: string;
  id?: string;
  scriptUrl?: string;
  alt?: string;
  signedOutAltText?: string;
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
    validators: [htmlMaxLength(signedOutAltTextMaxLength, undefined, "WARN")],
    placeholder: "Text to show users if they aren't signed in...",
  }),
  html: createTextField(),
  originalUrl: createTextField(),
  isMandatory: createCustomField(true, true),
  data: createCustomField<FormData>({}, undefined),
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
