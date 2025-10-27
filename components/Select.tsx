import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useImmer } from "use-immer";

type Props = {
  value: string;
  options: { label: string; value: string }[];
  height?: number;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

const Select = ({
  value,
  options,
  height = 25,
  placeholder = "Select Item",
  onChange,
  onBlur,
}: Props) => {
  const [isFocused, setIsFocused] = useImmer(false);

  return (
    <View className="mt-1 rounded-md bg-white p-2">
      <Dropdown
        style={[{ height }, isFocused && { borderColor: "blue" }]}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{ fontSize: 14 }}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={!isFocused ? placeholder : ""}
        value={value}
        onChange={(option) => {
          onChange(option.value);
          setIsFocused(false);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          onBlur && onBlur();
          setIsFocused(false);
        }}
      />
    </View>
  );
};

export default Select;
