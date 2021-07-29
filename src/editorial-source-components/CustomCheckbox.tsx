import { css } from "@emotion/react";
import { Checkbox, CheckboxGroup } from "@guardian/src-checkbox";
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
    margin-bottom: -12px;
  }
`;

const scaleFactor = 0.85;

const checkboxGroupStyles = css`
  ${labelStyles}
  span {
    transform: scale(${scaleFactor}) rotate(45deg);
  }
  div {
    margin-top: 0px;
    margin-bottom: 0px;
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
};

export const CustomCheckbox = (props: CustomCheckboxProps) => {
  return (
    <div css={parentStyles} data-cy={props.dataCy}>
      <CheckboxGroup name="emails" css={checkboxGroupStyles}>
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
