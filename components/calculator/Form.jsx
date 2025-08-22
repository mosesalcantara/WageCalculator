import { formatNumber, inputFormat } from "@/utils/utils";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./styles";

const Form = ({ db, parent, type, index, valuesState }) => {
  const actualRate = parent.rate;
  const minimumRate = 430;

  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);

  const [values, setValues] = valuesState;

  const isBelowMinimum = () => {
    return actualRate < minimumRate;
  };

  const checkType = () => {
    return ["Overtime Pay", "Night Differential"].includes(type);
  };

  const numToLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  const updateTotals = () => {
    setValues((prev) => {
      let subtotal = 0;
      prev[type].inputs.forEach((input) => {
        subtotal += parseFloat(input.total || 0);
      });

      return {
        ...prev,
        [type]: {
          inputs: prev[type].inputs,
          subtotal: `${subtotal}`,
        },
      };
    });
  };

  const handleInitialChange = (key, value) => {
    if (key.endsWith("_date")) {
      value = value.toISOString().split("T")[0];
    }

    setValues((prev) => {
      const updatedInputs = prev[type].inputs.map((input, inputIndex) => {
        if (index == inputIndex) {
          return {
            ...input,
            [key]: `${value}`,
          };
        } else return input;
      });

      return {
        ...prev,
        [type]: {
          inputs: updatedInputs,
          subtotal: prev[type].subtotal,
        },
      };
    });

    updateTotals();
  };

  const handleChange = (key, value) => {
    handleInitialChange(key, value);

    if (key == "start_date") {
      setStartDateModalVisible(false);
    } else if (key == "end_date") {
      setEndDateModalVisible(false);
    }
  };

  const calculate = () => {
    let total = 0;
    let rate = 0;
    isBelowMinimum() ? (rate = minimumRate) : (rate = actualRate);
    const daysOrHours = values[type].inputs[index].daysOrHours;

    if (type == "Basic Wage") {
      if (isBelowMinimum()) {
        total = (minimumRate - actualRate) * (daysOrHours || 0);
      }
    } else if (type == "Holiday Pay") {
      total = rate * (daysOrHours || 0);
    } else if (type == "Premium Pay") {
      total = rate * 0.3 * 2;
    } else if (type == "Overtime Pay") {
      total = (rate / 8) * 0.25 * daysOrHours;
    } else if (type == "Night Differential") {
      total = (rate / 8) * 0.1 * daysOrHours;
    } else if (type == "13th Month Pay") {
      total = (rate * daysOrHours) / 12 - values[type].inputs[index].received;
    }
    handleChange("total", total);
  };

  const addInput = () => {
    setValues((prev) => {
      return {
        ...prev,
        [type]: {
          inputs: [...prev[type].inputs, inputFormat],
          subtotal: prev[type].subtotal,
        },
      };
    });
  };

  const removeInput = (index) => {
    setValues((prev) => {
      const updatedInputs = prev[type].inputs;
      updatedInputs.splice(index, 1);

      return {
        ...prev,
        [type]: {
          inputs: updatedInputs,
          subtotal: prev[type].subtotal,
        },
      };
    });

    updateTotals();
  };

  return (
    <>
      <View style={{ marginHorizontal: 40, paddingTop: 10 }}>
        <View>
          <Text style={{ textAlign: "center" }}>
            Period {numToLetter(index)}
          </Text>
          <View>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateField]}
              onPress={() => setStartDateModalVisible(true)}
            >
              <Text>
                {values[type].inputs[index].start_date || "Select start date"}
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
                {values[type].inputs[index].end_date || "Select end date"}
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
              value={values[type].inputs[index].daysOrHours}
              onChangeText={(value) => handleChange("daysOrHours", value)}
            />
          </View>

          <View>
            {type == "13th Month Pay" && (
              <>
                <Text style={styles.label}>Received</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Enter pay received"
                  value={values[type].inputs[index].received}
                  onChangeText={(value) => handleChange("received", value)}
                />
              </>
            )}
          </View>
        </View>

        <View>
          <TouchableOpacity style={styles.calcAction} onPress={calculate}>
            <Text style={styles.calcActionText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Total:</Text>
          <Text style={styles.resultValue}>
            ₱{formatNumber(values[type].inputs[index].total)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {values[type].inputs.length - 1 == index && (
            <TouchableOpacity onPress={addInput}>
              <Text>Add</Text>
            </TouchableOpacity>
          )}

          {values[type].inputs.length > 1 && (
            <TouchableOpacity onPress={removeInput}>
              <Text>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
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
