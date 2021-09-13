import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/src-foundations";
import { Option, Select } from "@guardian/src-select";
import type { Options } from "../plugin/fieldViews/DropdownFieldView";
import { inputBorder } from "./inputBorder";
import { labelStyles } from "./Label";

// These styles allow us to style the div, svg, and span elements in the Source Select Component.
// However, they rely on it retaining its current structure, which is worth bearing in mind
// if we decided to bump the version of @guardian/src-select
const SelectWrapper = styled.div<{ display: "block" | "inline" }>`
  white-space: nowrap;
  width: initial;
  div {
    display: flex;
    :first-of-type {
      ${labelStyles}
      margin-top: ${space[2]}px;
      margin-bottom: ${space[2]}px;
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
  ${({ display }) =>
    display === "inline" &&
    `
    label {
      display: flex;
      align-items: center;
      >div:first-child {
        margin-right: ${space[3]}px;
      }
      /*
       * This resolves some margin problems introduced by
       * restyling the Source Select component to be inline with its
       * label
       */
      margin: -${space[2]}px 0;
    }`}
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
  options: Options;
  selected: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  dataCy: string;
  error: string;
  display: "block" | "inline";
};

export const CustomDropdown = (props: CustomDropdownProps) => {
  return (
    <SelectWrapper display={props.display} data-cy={props.dataCy}>
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
    </SelectWrapper>
  );
};
