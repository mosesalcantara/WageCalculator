import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useImmer } from "use-immer";

type Props = {
  value: string;
  options: { label: string; value: string }[];
  className?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

const Select = ({
  value,
  options,
  className = "",
  placeholder = "Select Item",
  onChange,
  onBlur,
}: Props) => {
  const textStyles = { fontFamily: "Geist_400Regular", fontSize: 14 };
  const [isFocused, setIsFocused] = useImmer(false);

  return (
    <View className={`rounded-md bg-white p-2 ${className}`}>
      <Dropdown
        style={[{ height: 25 }, isFocused && { borderColor: "blue" }]}
        placeholderStyle={textStyles}
        selectedTextStyle={textStyles}
        itemTextStyle={textStyles}
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
