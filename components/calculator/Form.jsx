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

const Form = () => {
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);

  const [values, setValues] = useState({
    start_date: "",
    end_date: "",
    days: "",
  });

  const [total, setTotal] = useState(0);

  const handleChange = (key, value) => {
    if (key.endsWith("_date")) {
      value = value.toISOString().split("T")[0];
    }

    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key == "start_date") {
      setStartDateModalVisible(false);
    } else if (key == "end_date") {
      setEndDateModalVisible(false);
    }
  };

  const calculate = () => {
    const actualRate = 400;
    const minimumRate = 430;
    let rate = 0;

    actualRate < minimumRate ? (rate = minimumRate) : (rate = actualRate);
    const total = rate * (values.days || 0);
    setTotal(total);
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
            <Text>{values.start_date || "Select start date"}</Text>
            <Icon name="date-range" size={20} color="#555" />
          </TouchableOpacity>

          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateField]}
            onPress={() => setEndDateModalVisible(true)}
          >
            <Text>{values.end_date || "Select end date"}</Text>
            <Icon name="date-range" size={20} color="#555" />
          </TouchableOpacity>

          <Text style={styles.label}>Days</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter days"
            value={values.days}
            onChangeText={(value) => handleChange("days", value)}
          />

          <View style={{ marginTop: 20 }}>
            <TouchableOpacity style={styles.calcAction} onPress={calculate}>
              <Text style={styles.calcActionText}>Calculate</Text>
            </TouchableOpacity>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Total:</Text>
              <Text style={styles.resultValue}>₱ {total.toFixed(2)}</Text>
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
