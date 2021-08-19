import type { FieldView as TFieldView } from "../plugin/fieldViews/FieldView";
import type { Field } from "../plugin/types/Element";
import { FieldView } from "../renderers/react/FieldView";
import { InputGroup } from "./InputGroup";
import { InputHeading } from "./InputHeading";

type Props<F> = {
  field: F;
  errors: string[];
  label: string;
};

export const FieldWrapper = <F extends Field<TFieldView<unknown>>>({
  field,
  errors,
  label,
}: Props<F>) => (
  <InputGroup>
    <InputHeading label={label} errors={errors} />
    <FieldView field={field} hasErrors={!!errors.length} />
  </InputGroup>
);
