import styled from "@emotion/styled";
import { neutral, space } from "@guardian/src-foundations";
import { Description } from "./Description";
import { Error } from "./Error";
import { Heading } from "./Heading";
import { Label } from "./Label";

const DemoInputHeadingContainer = styled.div<{ useAlternateStyles?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  ${({ useAlternateStyles }) =>
    useAlternateStyles
      ? `
    text-transform: uppercase;
    color: ${neutral[46]};
    padding: 2px 7px 1px;
    margin: ${space[1]}px 0;
  `
      : `margin-bottom: ${space[2]}px;`}
`;

// Because the `for` label element cannot be used with contenteditable,
// we must use `aria-labelledby` for the correct accessibility – but we
// lose the label onclick behaviour that we'd usually get with `for`. This
// link backfills that behaviour. See https://stackoverflow.com/a/54792667.
const LabelLink = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;
`;

const Errors = ({
  errors,
  useAlternateStyles,
}: {
  errors: string[];
  useAlternateStyles?: boolean;
}) =>
  errors.length === 0 ? null : (
    <Error useAlternateStyles={useAlternateStyles}>{errors.join(", ")}</Error>
  );

export const getFieldHeadingTestId = (name: string) => `FieldHeading-${name}`;

export type DemoInputHeadingProps = {
  headingLabel: React.ReactNode;
  fieldId?: string;
  headingContent?: React.ReactNode;
  description?: React.ReactNode;
  errors?: string[];
  name?: string;
  headingDirection?: "row" | "column";
  useAlternateStyles?: boolean;
};

// This component is used only in the prosemirror-elements internal demo
export const DemoInputHeading = ({
  headingLabel,
  headingContent,
  description,
  errors,
  name,
  fieldId,
  headingDirection = "row",
  useAlternateStyles = false,
}: DemoInputHeadingProps) => (
  <DemoInputHeadingContainer
    data-cy={getFieldHeadingTestId(name ?? "")}
    useAlternateStyles={useAlternateStyles}
  >
    <Heading headingDirection={headingDirection}>
      <LabelLink href={fieldId ? `#${fieldId}` : ""}>
        <Label
          id={fieldId ? `label-${fieldId}` : ""}
          useAlternateStyles={useAlternateStyles}
        >
          {headingLabel}
        </Label>
      </LabelLink>
      {headingContent}
    </Heading>
    {errors && errors.length > 0 ? (
      <Errors errors={errors} useAlternateStyles={useAlternateStyles} />
    ) : description !== null &&
      description !== undefined &&
      description !== false ? (
      <Description>{description}</Description>
    ) : null}
  </DemoInputHeadingContainer>
);
