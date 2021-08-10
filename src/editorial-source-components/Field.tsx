import type { FieldView as TFieldView } from "../plugin/fieldViews/FieldView";
import type { FieldViewSpec } from "../plugin/types/Element";
import { FieldView } from "../renderers/react/FieldView";
import { InputGroup } from "./InputGroup";
import { InputHeading } from "./InputHeading";

type Props<F> = {
  fieldViewSpec: F;
  errors: string[];
  label: string;
};

export const Field = <F extends FieldViewSpec<TFieldView<unknown>>>({
  fieldViewSpec,
  errors,
  label,
}: Props<F>) => (
  <InputGroup>
    <InputHeading label={label} errors={errors} />
    <FieldView fieldViewSpec={fieldViewSpec} hasErrors={!!errors.length} />
  </InputGroup>
);
