import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const Select = ({
  name,
  options,
  placeholder = "Select Item",
  value,
  setFieldValue,
  setFieldTouched,
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : ""}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => {
          setFieldTouched(name);
          setIsFocus(false);
        }}
        onChange={(option) => {
          setFieldValue(name, option.value);
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
    height: 20,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
});
