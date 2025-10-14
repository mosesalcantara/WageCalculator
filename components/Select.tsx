import { useState } from "react";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type Props = {
  name: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  value: string;
  index: number;
  onChange: (key: string, value: string, index: number) => void;
};

const Select = ({
  name,
  options,
  placeholder = "Select Item",
  value,
  index,
  onChange,
}: Props) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View className="h-11 rounded-md border border-black p-2">
      <Dropdown
        style={{ height: 20 }}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{ fontSize: 14 }}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : ""}
        value={value}
        onChange={(option) => {
          onChange(name, option.value, index);
          setIsFocus(false);
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => {
          setIsFocus(false);
        }}
      />
    </View>
  );
};

export default Select;
