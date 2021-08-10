import { css } from "@emotion/react";
import { space } from "@guardian/src-foundations";
import { Option, Select } from "@guardian/src-select";
import type { Option as OptionValue } from "../plugin/fieldViews/DropdownFieldView";
import { inputBorder } from "./inputBorder";
import { labelStyles } from "./Label";

// These styles allow us to style the div, svg, and span elements in the Source Select Component.
// However, they rely on it retaining its current structure, which is worth bearing in mind
// if we decided to bump the version of @guardian/src-select
const parentStyles = css`
  white-space: nowrap;
  width: initial;
  div {
    display: flex;
    :first-of-type {
      ${labelStyles}
    }
    svg {
      height: ${space[5]}px;
      top: 3px;
      position: relative;
      right: 30px;
    }
  }
  span {
    font-family: "Guardian Agate Sans";
    font-size: 1rem;
    svg {
      width: ${space[6]}px;
      height: ${space[6]}px;
      margin-top: 1px;
      margin-left: 1px;
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
  options: Array<OptionValue<string>>;
  selected: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  dataCy: string;
  error: string;
};

export const CustomDropdown = (props: CustomDropdownProps) => {
  return (
    <div css={parentStyles} data-cy={props.dataCy}>
      <Select
        error={props.error}
        label={props.label}
        onChange={props.onChange}
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
