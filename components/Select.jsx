import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const Select = ({ options, placeholder = "Select Item", valueState }) => {
  const [value, setValue] = valueState;
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 7,
        marginTop: 3,
        borderRadius: 5,
      }}
    >
      <Dropdown
        style={[
          {
            height: 27,
          },
          isFocus && { borderColor: "blue" },
        ]}
        placeholderStyle={{
          fontSize: 14,
        }}
        selectedTextStyle={{
          fontSize: 14,
        }}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : ""}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(option) => {
          setValue(option.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

export default Select;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 7,
    marginTop: 3,
    borderRadius: 5,
  },
  dropdown: {
    height: 27,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
});
