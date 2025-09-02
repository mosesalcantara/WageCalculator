import {
  calculate,
  formatNumber,
  numberToLetter,
  periodFormat,
} from "@/utils/utils";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const Form = ({
  db,
  parent,
  type,
  index,
  valuesState,
  handleInitialChange,
}) => {
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);
  const [values, setValues] = valuesState;

  const formatDate = (date) => {
    return date ? new Date(date) : new Date();
  };

  const checkType = () => {
    return ["Overtime Pay", "Night Differential"].includes(type);
  };

  const handleChange = (key, value) => {
    handleInitialChange(key, value, index);

    if (key == "start_date") {
      setStartDateModalVisible(false);
    } else if (key == "end_date") {
      setEndDateModalVisible(false);
    }
  };

  const addPeriod = () => {
    setValues((prev) => {
      return {
        ...prev,
        [type]: { periods: [...prev[type].periods, periodFormat] },
      };
    });
  };

  const removePeriod = () => {
    setValues((prev) => {
      const updatedPeriods = prev[type].periods;
      updatedPeriods.splice(index, 1);

      return { ...prev, [type]: { periods: updatedPeriods } };
    });
  };

  const clearPeriod = () => {
    setValues((prev) => {
      const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
        index == periodIndex ? periodFormat : period
      );

      return { ...prev, [type]: { periods: updatedPeriods } };
    });
  };

  return (
    <>
      <View
        style={{
          marginHorizontal: 40,
          paddingTop: 10,
          borderTopColor: "#0d3dffff",
          borderTopWidth: 5,
          borderRightColor: "#0d3dffff",
          borderRightWidth: 1,
          borderLeftColor: "#0d3dffff",
          borderLeftWidth: 1,
          borderBottomColor: "#0d3dffff",
          borderBottomWidth: 1,
          borderRadius: 8,
          marginBottom: 20,
          padding: 10,
        }}
      >
        <View>
          <Text style={{ textAlign: "center" }}>
            {values[type].periods.length > 1 &&
              `Period ${numberToLetter(index)}`}
          </Text>
          <View>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateField]}
              onPress={() => setStartDateModalVisible(true)}
            >
              <Text>
                {values[type].periods[index].start_date || "Select start date"}
              </Text>
              <Icon name="date-range" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateField]}
              onPress={() => setEndDateModalVisible(true)}
            >
              <Text>
                {values[type].periods[index].end_date || "Select end date"}
              </Text>
              <Icon name="date-range" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.label}>{checkType() ? "Hours" : "Days"}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder={`Enter ${checkType() ? "hours" : "days"}`}
              value={values[type].periods[index].daysOrHours}
              onChangeText={(value) => handleChange("daysOrHours", value)}
            />
          </View>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Total:</Text>
          <Text style={styles.resultValue}>
            ₱
            {formatNumber(
              calculate(values[type].periods[index], parent.rate, type)
            )}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {values[type].periods.length - 1 == index && (
            <TouchableOpacity onPress={addPeriod}>
              <Text
                style={[
                  styles.calcButtonText,
                  {
                    paddingStart: 10,
                    paddingEnd: 10,
                    backgroundColor: "#008000",
                    color: "#ffffffff",
                    borderTopColor: "#008000",
                    borderTopWidth: 1,
                    borderRightColor: "#008000",
                    borderRightWidth: 1,
                    borderLeftColor: "#008000",
                    borderLeftWidth: 1,
                    borderBottomColor: "#008000",
                    borderBottomWidth: 1,
                    borderRadius: 5,
                    padding: 5,
                  },
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={clearPeriod}>
            <Text
              style={[
                styles.calcButtonText,
                {
                  paddingStart: 10,
                  paddingEnd: 10,
                  backgroundColor: "#f79812ff",
                  color: "#ffffffff",
                  borderTopColor: "#f79812ff",
                  borderTopWidth: 1,
                  borderRightColor: "#f79812ff",
                  borderRightWidth: 1,
                  borderLeftColor: "#f79812ff",
                  borderLeftWidth: 1,
                  borderBottomColor: "#f79812ff",
                  borderBottomWidth: 1,
                  borderRadius: 5,
                  padding: 5,
                },
              ]}
            >
              Clear
            </Text>
          </TouchableOpacity>

          {values[type].periods.length > 1 && (
            <TouchableOpacity onPress={removePeriod}>
              <Text
                style={[
                  styles.calcButtonText,
                  {
                    paddingStart: 10,
                    paddingEnd: 10,
                    backgroundColor: "#e71414ff",
                    color: "#ffffffff",
                    borderTopColor: "#e71414ff",
                    borderTopWidth: 1,
                    borderRightColor: "#e71414ff",
                    borderRightWidth: 1,
                    borderLeftColor: "#e71414ff",
                    borderLeftWidth: 1,
                    borderBottomColor: "#e71414ff",
                    borderBottomWidth: 1,
                    borderRadius: 5,
                    padding: 5,
                  },
                ]}
              >
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <DateTimePickerModal
        isVisible={startDateModalVisible}
        mode="date"
        date={formatDate(values[type].periods[index].start_date)}
        onConfirm={(value) => {
          handleChange("start_date", value);
        }}
        onCancel={() => setStartDateModalVisible(false)}
      />

      <DateTimePickerModal
        isVisible={endDateModalVisible}
        mode="date"
        date={formatDate(values[type].periods[index].end_date)}
        onConfirm={(value) => {
          handleChange("end_date", value);
        }}
        onCancel={() => setEndDateModalVisible(false)}
      />
    </>
  );
};

export default Form;
