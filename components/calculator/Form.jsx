import {
  calculate,
  formatNumber,
  periodFormat,
  numToLetter,
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
    return date ? (date = new Date(date)) : (date = new Date());
  };

  const checkType = () => {
    return ["Overtime Pay", "Night Differential"].includes(type);
  };

  const handleChange = (key, value) => {
    handleInitialChange(index, key, value);

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
        [type]: {
          periods: [...prev[type].periods, periodFormat],
        },
      };
    });
  };

  const removePeriod = () => {
    setValues((prev) => {
      const updatedPeriods = prev[type].periods;
      updatedPeriods.splice(index, 1);

      return {
        ...prev,
        [type]: {
          periods: updatedPeriods,
        },
      };
    });
  };

  const clearPeriod = () => {
    setValues((prev) => {
      const updatedPeriods = prev[type].periods.map((period, periodIndex) => {
        if (index == periodIndex) {
          return periodFormat;
        } else return period;
      });

      return {
        ...prev,
        [type]: {
          periods: updatedPeriods,
        },
      };
    });
  };

  return (
    <>
      <View style={{ marginHorizontal: 40, paddingTop: 10 }}>
        <View>
          <Text style={{ textAlign: "center" }}>
            {values[type].periods.length > 1 && `Period ${numToLetter(index)}`}
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
            ₱{formatNumber(calculate(values, type, index, parent.rate))}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {values[type].periods.length - 1 == index && (
            <TouchableOpacity onPress={addPeriod}>
              <Text>Add</Text>
            </TouchableOpacity>
          )}

          {values[type].periods.length > 1 && (
            <TouchableOpacity onPress={removePeriod}>
              <Text>Remove</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={clearPeriod}>
            <Text>Clear</Text>
          </TouchableOpacity>
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
