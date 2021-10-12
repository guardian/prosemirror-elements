import type { ValidationError } from "../plugin/elementSpec";
import type { FieldView as TFieldView } from "../plugin/fieldViews/FieldView";
import type { Field } from "../plugin/types/Element";
import { FieldView } from "../renderers/react/FieldView";
import { InputHeading } from "./InputHeading";

type Props<F> = {
  field: F;
  errors?: ValidationError[];
  headingLabel: React.ReactNode;
  headingContent?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

export const FieldWrapper = <F extends Field<TFieldView<unknown>>>({
  field,
  errors = [],
  headingLabel,
  headingContent = null,
  description,
  className,
}: Props<F>) => (
  <div className={className}>
    <InputHeading
      headingLabel={headingLabel}
      headingContent={headingContent}
      description={description}
      errors={errors.map((e) => e.error)}
    />
    <FieldView field={field} hasValidationErrors={!!errors.length} />
  </div>
);
