import { css } from "@emotion/react";
import { Checkbox, CheckboxGroup } from "@guardian/src-checkbox";
import { space } from "@guardian/src-foundations";
import { labelStyles } from "./Label";

// These styles allow us to style the div elements in the Source Checkbox Component.
// However, they rely on it retaining its current structure, which is worth bearing in mind
// if we decided to bump the version of @guardian/src-checkbox
const parentStyles = css`
  white-space: nowrap;
  div {
    ${labelStyles}
  }
  label {
    margin-top: -6px;
    margin-bottom: -6px;
  }
  // Re-order the checkbox field and error message
  fieldset {
    display: flex;
    flex-direction: column-reverse;
  }
`;

const scaleFactor = 0.85;

const checkboxGroupStyles = css`
  ${labelStyles}
  // Style the error message
  span {
    font-size: 0.9375rem;
    transform: scale(${scaleFactor}) rotate(45);
    svg {
      height: ${space[6]}px;
      margin-top: 2px;
    }
  }
  div {
    line-height: 1;
  }
`;
const checkboxStyles = css`
  transform: scale(${scaleFactor});
`;

type CustomCheckboxProps = {
  checked: boolean;
  text: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dataCy: string;
  error: string;
};

export const CustomCheckbox = (props: CustomCheckboxProps) => {
  return (
    <div css={parentStyles} data-cy={props.dataCy}>
      <CheckboxGroup
        name="emails"
        error={props.error ? props.error : undefined}
        css={checkboxGroupStyles}
      >
        <Checkbox
          css={checkboxStyles}
          value={props.text}
          label={props.text}
          checked={props.checked}
          onChange={props.onChange}
        />
      </CheckboxGroup>
    </div>
  );
};
