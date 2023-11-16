import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { Description } from "./Description";
import { Error } from "./Error";
import { Heading } from "./Heading";
import { Label } from "./Label";

const InputHeadingContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: ${space[2]}px;
`;

// Because the `for` label element cannot be used with contenteditable,
// we must use `aria-labelledby` for the correct accessibility – but we
// lose the label onclick behaviour that we'd usually get with `for`. This
// link backfills that behaviour. See https://stackoverflow.com/a/54792667.
const LabelLink = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  margin-right: ${space[2]}px;
`;

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

export const getFieldHeadingTestId = (name: string) => `FieldHeading-${name}`;

export type InputHeadingProps = {
  headingLabel: React.ReactNode;
  fieldId?: string;
  headingContent?: React.ReactNode;
  description?: React.ReactNode;
  errors?: string[];
  name?: string;
  headingDirection?: "row" | "column";
};

export const InputHeading = ({
  headingLabel,
  headingContent,
  description,
  errors,
  name,
  fieldId,
  headingDirection = "row",
}: InputHeadingProps) => (
  <InputHeadingContainer data-cy={getFieldHeadingTestId(name ?? "")}>
    <Heading headingDirection={headingDirection}>
      <LabelLink href={fieldId ? `#${fieldId}` : ""}>
        <Label id={fieldId ? `label-${fieldId}` : ""}>{headingLabel}</Label>
      </LabelLink>
      {headingContent}
    </Heading>
    {errors && errors.length > 0 ? (
      <Errors errors={errors} />
    ) : description ? (
      <Description>{description}</Description>
    ) : null}
  </InputHeadingContainer>
);
