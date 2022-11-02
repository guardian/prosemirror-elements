import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { htmlMaxLength, htmlRequired } from "../../plugin/helpers/validation";
import { useTyperighterAttrs } from "../helpers/typerighter";
import { createFlatRichTextField } from "../../plugin/fieldViews/RichTextFieldView";
import {createReactElementSpec} from "../../renderers/react/createReactElementSpec";
// import type { Schema } from "prosemirror-model";
// import type { Plugin } from "prosemirror-state";

// export type cartoonElementOptions = {
//     createCaptionPlugins?: (schema: Schema) => Plugin[];
// };

export const cartoonFields = ({
    // createCaptionPlugins: any
  }) => {
    return {
        altText: createTextField({
            rows: 2,
            validators: [htmlMaxLength(1000), htmlRequired()],
            placeholder: "Add alt text",
            isResizeable: true,
            attrs: useTyperighterAttrs,
        }),
        caption: createFlatRichTextField({
            // createPlugins: createCaptionPlugins,
            marks: "em strong link strike",
            placeholder: "Add caption",
            attrs: useTyperighterAttrs,
        }),
        comicCredit: createTextField({
            rows: 2,
            validators: [htmlMaxLength(1000)],
            placeholder: "Add comic credit",
            isResizeable: true,
            attrs: useTyperighterAttrs,
        })
    };
};

export const cartoonElement = createReactElementSpec(
    cartoonFields,
    ({ fields }) => {
      return (
        <cartoonElement
          fields={fields}
        />
      );
    }
  );

