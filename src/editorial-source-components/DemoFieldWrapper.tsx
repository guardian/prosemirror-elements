import type { ValidationError } from "../plugin/elementSpec";
import type { FieldView } from "../plugin/fieldViews/FieldView";
import type { Field } from "../plugin/types/Element";
import { FieldComponent } from "../renderers/react/FieldComponent";
import { DemoInputHeading } from "./DemoInputHeading";

type Props<F> = {
  field: F;
  // If provided, these errors override the errors in the field.
  errors?: ValidationError[];
  headingLabel?: React.ReactNode;
  headingContent?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  headingDirection?: "row" | "column";
  useAlternateStyles?: boolean;
  showHeading?: boolean;
};

// This component is used only in the prosemirror-elements internal demo
export const DemoFieldWrapper = <F extends Field<FieldView<unknown>>>({
  field,
  errors,
  headingLabel,
  headingContent = null,
  description,
  className,
  headingDirection,
  useAlternateStyles,
  showHeading = true,
}: Props<F>) => (
  <div className={className}>
    {showHeading ? (
      <DemoInputHeading
        name={field.name}
        fieldId={field.view.getId()}
        headingLabel={headingLabel}
        headingContent={headingContent}
        description={description}
        errors={(errors ? errors : field.errors).map((e) => e.error)}
        headingDirection={headingDirection}
        useAlternateStyles={useAlternateStyles}
      />
    ) : null}
    <FieldComponent
      field={field}
      hasValidationErrors={!!field.errors.length}
      useAlternateStyles={useAlternateStyles}
    />
  </div>
);
