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
  const [isFocus, setIsFocus] = useImmer(false);

  return (
    <View className="mt-1 rounded-md bg-white p-2">
      <Dropdown
        style={[{ height: 25 }, isFocus && { borderColor: "blue" }]}
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
