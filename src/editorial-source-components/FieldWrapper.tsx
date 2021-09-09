import type { ValidationError } from "../plugin/elementSpec";
import type { FieldView as TFieldView } from "../plugin/fieldViews/FieldView";
import type { Field } from "../plugin/types/Element";
import { FieldView } from "../renderers/react/FieldView";
import { InputHeading } from "./InputHeading";

type Props<F> = {
  field: F;
  errors: ValidationError[];
  label: React.ReactNode;
  className?: string;
};

export const FieldWrapper = <F extends Field<TFieldView<unknown>>>({
  field,
  errors,
  label,
  className,
}: Props<F>) => (
  <div className={className}>
    <InputHeading label={label} errors={errors} />
    <FieldView field={field} hasValidationErrors={!!errors.length} />
  </div>
);
