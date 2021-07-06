import { Option, Select } from "@guardian/src-select";

type OptionValue = {
  text: string;
  value: string;
};

export const createSelect = (
  options: OptionValue[],
  selected: string,
  changeHandler: (event: React.ChangeEvent<HTMLSelectElement>) => void
) => {
  return (
    <Select label="Placeholder" onChange={changeHandler}>
      {options.map((option) => (
        <Option value={option.value} selected={selected === option.value}>
          {option.text}
        </Option>
      ))}
    </Select>
  );
};
