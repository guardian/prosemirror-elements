import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { Description } from "./Description";
import { Error } from "./Error";
import { Label } from "./Label";

const InputHeadingContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: ${space[2]}px;
`;

const Heading = styled.div`
  display: inline-flex;
  flex-grow: 1;
`;

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

export const getFieldHeadingTestId = (name: string) => `FieldHeading-${name}`;

type Props = {
  headingLabel: React.ReactNode;
  headingContent: React.ReactNode;
  description?: React.ReactNode;
  errors: string[];
  name: string;
};

export const InputHeading = ({
  headingLabel,
  headingContent,
  description,
  errors,
  name,
}: Props) => (
  <InputHeadingContainer data-cy={getFieldHeadingTestId(name)}>
    <Heading>
      <Label>{headingLabel}</Label>
      {headingContent}
    </Heading>
    {errors.length > 0 ? (
      <Errors errors={errors} />
    ) : description ? (
      <Description>{description}</Description>
    ) : null}
  </InputHeadingContainer>
);
