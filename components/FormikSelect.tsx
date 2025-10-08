import { useState } from "react";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type Props = {
  name: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  value: string;
  setFieldValue: (name: string, value: string) => void;
  setFieldTouched: (name: string) => void;
};

const Select = ({
  name,
  options,
  placeholder = "Select Item",
  value,
  setFieldValue,
  setFieldTouched,
}: Props) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View className="mt-1 rounded-md bg-white p-2">
      <Dropdown
        style={[{ height: 20 }, isFocus && { borderColor: "blue" }]}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{ fontSize: 14 }}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : ""}
        value={value}
        onChange={(option) => {
          setFieldValue(name, option.value);
          setIsFocus(false);
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => {
          setFieldTouched(name);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

export default Select;
