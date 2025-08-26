import { formatNumber, getRate, inputFormat, numToLetter } from "@/utils/utils";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const Form = ({ db, parent, type, index, valuesState }) => {
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);
  const [values, setValues] = valuesState;
  const [isErrorDisplayed, setIsErrorDisplayed] = useState(false);

  const checkType = () => {
    return ["Overtime Pay", "Night Differential"].includes(type);
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

  const validate = () => {
    return Object.values(values[type].inputs[index]).every((value) => value);
  };

  const calculate = () => {
    const isValid = validate();
    const actualRate = parent.rate;
    let total = 0;

    if (isValid) {
      const startDate = values[type].inputs[index].start_date;
      const daysOrHours = values[type].inputs[index].daysOrHours;
      const { minimumRate, isBelow, rate } = getRate(startDate, actualRate);

      if (type == "Basic Wage") {
        if (isBelow) {
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
    }

    setIsErrorDisplayed(!isValid);
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

  const removeInput = () => {
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
            {values[type].inputs.length > 1 && `Period ${numToLetter(index)}`}
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
          {isErrorDisplayed && (
            <Text style={{ color: "red", textAlign: "center", marginTop: 5 }}>
              All Fields are Required
            </Text>
          )}
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
