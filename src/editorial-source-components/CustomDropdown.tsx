import { css } from "@emotion/react";
import { space } from "@guardian/src-foundations";
import { Option, Select } from "@guardian/src-select";
import { inputBorder } from "./inputBorder";
import { labelStyles } from "./Label";

type OptionValue = {
  text: string;
  value: string;
};

const parentStyles = css`
  width: initial;
  div {
    display: flex;
    :first-child {
      ${labelStyles}
    }
    svg {
      height: ${space[5]}px;
      top: 3px;
      position: relative;
      right: 30px;
    }
  }
`;

const selectStyles = css`
  ${inputBorder}
  font-size: 14px;
  height: ${space[6]}px;
  width: initial;
  padding-right: 50px !important;
  :hover {
    cursor: pointer;
  }
`;

type CustomDropdownProps = {
  options: OptionValue[];
  selected: string;
  label: string;
  changeHandler: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const CustomDropdown = (props: CustomDropdownProps) => {
  return (
    <div css={parentStyles}>
      <Select
        label={props.label}
        onChange={props.changeHandler}
        value={props.selected}
        css={selectStyles}
      >
        {props.options.map((option) => (
          <Option value={option.value} key={option.value}>
            {option.text}
          </Option>
        ))}
      </Select>
    </div>
  );
};
