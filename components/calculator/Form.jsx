import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./styles";

const Form = ({ db, parent, type, valuesState, handleInitialChange }) => {
  const actualRate = parent.rate;
  const minimumRate = 430;

  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);

  const [values, setValues] = valuesState;

  const handleChange = (key, value) => {
    handleInitialChange(type, key, value);

    if (key == "start_date") {
      setStartDateModalVisible(false);
    } else if (key == "end_date") {
      setEndDateModalVisible(false);
    }
  };

  const isBelowMinimum = () => {
    return actualRate < minimumRate;
  };

  const calculate = () => {
    let total = 0;
    let rate = 0;
    isBelowMinimum() ? (rate = minimumRate) : (rate = actualRate);
    const daysOrHours = values[type].daysOrHours

    if (type == "Basic Wage") {
      if (!isBelowMinimum()) {
        total = (minimumRate - actualRate) * (daysOrHours || 0);
        handleChange("total", total);
      }
    } else if (type == "Holiday Pay") {
      total = rate * (daysOrHours || 0);
    } else if (type == "Premium Pay") {
      total = rate * 0.3 * 2;
    } else if (type == "Overtime Pay") {
      total = (rate / 8) * 0.25 * daysOrHours;
    } else if (type == "Night Differential") {
      total = (rate / 8) * 0.10 * daysOrHours;
    }
    handleChange("total", total);
  };

  const checkType = () => {
    return ["Overtime Pay", "Night Differential"].includes(type);
  };

  return (
    <>
      <View style={{ ...styles.container, padding: 10 }}>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateField]}
            onPress={() => setStartDateModalVisible(true)}
          >
            <Text>{values[type].start_date || "Select start date"}</Text>
            <Icon name="date-range" size={20} color="#555" />
          </TouchableOpacity>

          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateField]}
            onPress={() => setEndDateModalVisible(true)}
          >
            <Text>{values[type].end_date || "Select end date"}</Text>
            <Icon name="date-range" size={20} color="#555" />
          </TouchableOpacity>

          <Text style={styles.label}>{checkType() ? "Hours" : "Days"}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder={`Enter ${checkType() ? "hours" : "days"}`}
            value={values[type].daysOrHours}
            onChangeText={(value) => handleChange("daysOrHours", value)}
          />

          <View style={{ marginTop: 20 }}>
            <TouchableOpacity style={styles.calcAction} onPress={calculate}>
              <Text style={styles.calcActionText}>Calculate</Text>
            </TouchableOpacity>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Total:</Text>
              <Text style={styles.resultValue}>
                ₱{" "}
                {(values[type].total || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <DateTimePickerModal
        isVisible={startDateModalVisible}
        mode="date"
        onConfirm={(value) => {
          handleChange("start_date", value);
        }}
        onCancel={() => setStartDateModalVisible(false)}
      />

      <DateTimePickerModal
        isVisible={endDateModalVisible}
        mode="date"
        onConfirm={(value) => {
          handleChange("end_date", value);
        }}
        onCancel={() => setEndDateModalVisible(false)}
      />
    </>
  );
};

export default Form;
