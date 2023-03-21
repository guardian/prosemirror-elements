import type { ValidationError } from "../plugin/elementSpec";
import type { FieldView as TFieldView } from "../plugin/fieldViews/FieldView";
import type { Field } from "../plugin/types/Element";
import { FieldView } from "../renderers/react/FieldView";
import { InputHeading } from "./InputHeading";

type Props<F> = {
  field: F;
  // If provided, these errors override the errors in the field.
  errors?: ValidationError[];
  headingLabel: React.ReactNode;
  headingContent?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  headingDirection?: "row" | "column";
};

export const FieldWrapper = <F extends Field<TFieldView<unknown>>>({
  field,
  errors,
  headingLabel,
  headingContent = null,
  description,
  className,
  headingDirection,
}: Props<F>) => (
  <div className={className}>
    <InputHeading
      name={field.name}
      fieldId={field.view.getId()}
      headingLabel={headingLabel}
      headingContent={headingContent}
      description={description}
      errors={(errors ? errors : field.errors).map((e) => e.error)}
      headingDirection={headingDirection}
    />
    <FieldView field={field} hasValidationErrors={!!field.errors.length} />
  </div>
);
