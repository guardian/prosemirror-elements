import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";

export const photoGalleryElement = createReactElementSpec(
  {
    images: createRepeaterField({
      caption: createTextField(),
    }),
  },
  ({ fields, fieldValues }) => <div>{JSON.stringify(fieldValues)}</div>
);
