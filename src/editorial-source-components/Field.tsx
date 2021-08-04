import type {
  FieldViewSpec,
  NonCustomFieldViews,
} from "../plugin/types/Element";
import { FieldView } from "../renderers/react/FieldView";
import { InputGroup } from "./InputGroup";
import { InputHeading } from "./InputHeading";

type Props = {
  fieldViewSpec: FieldViewSpec<NonCustomFieldViews>;
  errors: string[];
  label: string;
};

export const Field = ({ fieldViewSpec, errors, label }: Props) => (
  <InputGroup>
    <InputHeading label={label} errors={errors} />
    <FieldView fieldViewSpec={fieldViewSpec} hasErrors={!!errors.length} />
  </InputGroup>
);
