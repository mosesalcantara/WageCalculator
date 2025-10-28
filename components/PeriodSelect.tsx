import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useImmer } from "use-immer";

type Props = {
  index: number;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange: (index: number, key: string, value: string) => void;
};

const Select = ({
  index,
  name,
  value,
  options,
  placeholder = "Select Item",
  onChange,
}: Props) => {
  const textStyles = { fontFamily: "Geist_400Regular", fontSize: 14 };
  const [isFocused, setIsFocused] = useImmer(false);

  return (
    <View className="h-12 rounded-md border border-black p-2">
      <Dropdown
        style={{ height: 20 }}
        placeholderStyle={textStyles}
        selectedTextStyle={textStyles}
        itemTextStyle={textStyles}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={!isFocused ? placeholder : ""}
        value={value}
        onChange={(option) => {
          onChange(index, name, option.value);
          setIsFocused(false);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export default Select;
