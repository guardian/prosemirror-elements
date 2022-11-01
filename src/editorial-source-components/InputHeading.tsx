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

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

export const getFieldHeadingTestId = (name: string) => `FieldHeading-${name}`;

export type InputHeadingProps = {
  headingLabel: React.ReactNode;
  labelId?: string;
  headingContent?: React.ReactNode;
  description?: React.ReactNode;
  errors?: string[];
  name?: string;
};

export const InputHeading = ({
  headingLabel,
  headingContent,
  description,
  errors,
  name,
  labelId,
}: InputHeadingProps) => (
  <InputHeadingContainer data-cy={getFieldHeadingTestId(name ?? "")}>
    <Heading>
      <Label id={labelId}>{headingLabel}</Label>
      {headingContent}
    </Heading>
    {errors && errors.length > 0 ? (
      <Errors errors={errors} />
    ) : description ? (
      <Description>{description}</Description>
    ) : null}
  </InputHeadingContainer>
);
