import styled from "@emotion/styled";
import { Error } from "./Error";
import { Label } from "./Label";

const InputHeadingContainer = styled.div`
  display: flex;
`;

const Errors = ({ errors }: { errors: string[] }) =>
  !errors.length ? null : <Error>{errors.join(", ")}</Error>;

type Props = {
  label: string;
  errors: string[];
};

export const InputHeading = ({ label, errors }: Props) => (
  <InputHeadingContainer>
    <Label>{label}</Label>
    <Errors errors={errors} />
  </InputHeadingContainer>
);
