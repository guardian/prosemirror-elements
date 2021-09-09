import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { Error } from "./Error";
import { Label } from "./Label";

const InputHeadingContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: ${space[2]}px;
  margin-bottom: ${space[2]}px;
  label {
    // Ensure that the label pushes error messages to the rhs
    // if they occupy the same line, to ensure the error message
    // is right-aligned.
    flex-grow: 1;
  }
`;

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

type Props = {
  label: React.ReactNode;
  errors: string[];
};

export const InputHeading = ({ label, errors }: Props) => (
  <InputHeadingContainer>
    <Label>{label}</Label>
    <Errors errors={errors} />
  </InputHeadingContainer>
);
