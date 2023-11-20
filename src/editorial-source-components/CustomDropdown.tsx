import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { space } from "@guardian/source-foundations";
import { Option, Select } from "@guardian/source-react-components";
import React from "react";
import type { Options } from "../plugin/fieldViews/DropdownFieldView";
import { inputBorder } from "./inputBorder";
import { labelStyles } from "./Label";

// These styles allow us to style the div, svg, and label elements in the Source Select Component.
// However, they rely on it retaining its current structure, which is worth bearing in mind
// if we decided to bump the version of @guardian/source-react-components
const SelectWrapper = styled.div<{ display: "block" | "inline" }>`
  white-space: nowrap;
  width: initial;
  div {
    display: flex;
  }
  label div {
    ${labelStyles}
    ${({ display }) => display === "block" && `margin-bottom: ${space[2]}px;`}
  }
  div svg {
    height: ${space[5]}px;
    top: 3px;
    position: relative;
    right: 30px;
  }
  ${({ display }) =>
    display === "inline" &&
    `
      display: flex;
      align-items: center;
      div:first-child {
        margin-right: ${space[3]}px;
      }
    `}
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
  font-family: "Guardian Agate Sans";
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

export const CustomDropdown = React.memo((props: CustomDropdownProps) => {
  return (
    <SelectWrapper display={props.display} data-cy={props.dataCy}>
      <Select
        error={props.error}
        label={props.label}
        onChange={props.onChange}
        value={props.selected}
        cssOverrides={selectStyles}
      >
        {props.options.map((option) => (
          <Option value={option.value} key={option.value}>
            {option.text}
          </Option>
        ))}
      </Select>
    </SelectWrapper>
  );
});
