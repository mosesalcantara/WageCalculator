import { useImmer } from "use-immer";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type Props = {
  name: string;
  value: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  setFieldValue: (name: string, value: string) => void;
  setFieldTouched: (name: string) => void;
};

const Select = ({
  name,
  value,
  options,
  placeholder = "Select Item",
  setFieldValue,
  setFieldTouched,
}: Props) => {
  const [isFocused, setIsFocused] = useImmer(false);

  return (
    <View className="mt-1 rounded-md bg-white p-2">
      <Dropdown
        style={[{ height: 25 }, isFocused && { borderColor: "blue" }]}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{ fontSize: 14 }}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={!isFocused ? placeholder : ""}
        value={value}
        onChange={(option) => {
          setFieldValue(name, option.value);
          setIsFocused(false);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setFieldTouched(name);
          setIsFocused(false);
        }}
      />
    </View>
  );
};

export default Select;
