import { createRepeaterField } from "../../plugin/fieldViews/RepeaterFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";

export const photoGalleryElement = createReactElementSpec(
  {
    images: createRepeaterField({
      caption: createTextField(),
    }),
  },
  () => <div></div>
);
