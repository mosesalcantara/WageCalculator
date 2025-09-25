import { Employee, ViolationTypes, ViolationValues } from "@/types/globals";
import {
  calculate,
  daysArray,
  formatNumber,
  numberToLetter,
  periodFormat,
} from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eachDayOfInterval, format } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

type Props = {
  parent: Employee;
  type: ViolationTypes;
  index: number;
  valuesState: [ViolationValues, Dispatch<SetStateAction<ViolationValues>>];
  handleInitialChange: (
    key: string,
    value: string | number | Date,
    index?: number,
  ) => void;
};

const Form = ({
  parent,
  type,
  index,
  valuesState,
  handleInitialChange,
}: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useState(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useState(false);
  const [values, setValues] = valuesState;

  const formatDate = (date: string) => {
    return date ? new Date(date) : new Date();
  };

  const checkType = () => {
    return ["Overtime Pay", "Night Differential"].includes(type);
  };

  const getIncludedDays = (startDay: string, endDay: string) => {
    const included = [];

    let i = daysArray.indexOf(startDay);
    let index = 0;

    while (daysArray[index] != endDay) {
      index = i % daysArray.length;
      included.push(daysArray[index]);
      ++i;
    }

    return included;
  };

  const includedDays = getIncludedDays(parent.start_day, parent.end_day);

  const handleChange = (key: string, value: string | number | Date) => {
    handleInitialChange(key, value, index);

    if (key == "start_date") {
      setIsStartDateModalVisible(false);
    } else if (key == "end_date") {
      setIsEndDateModalVisible(false);
    }
  };

  const getWorkingDays = (startDate: string, endDate: string) => {
    const dates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
    const workingDates = dates.filter((date) =>
      includedDays.includes(format(date, "EEEE")),
    );
    return workingDates.length;
  };

  const setWorkingDays = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
      const workingDays = getWorkingDays(startDate, endDate);
      if (type == "Basic Wage" || type == "13th Month Pay") {
        handleInitialChange("daysOrHours", workingDays, index);
      }
    }
  };

  const addPeriod = () => {
    setValues((prev) => {
      return {
        ...prev,
        [type]: {
          periods: [...prev[type as ViolationTypes].periods, periodFormat],
        },
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
      const updatedPeriods = prev[type as ViolationTypes].periods.map(
        (period, periodIndex) => (index == periodIndex ? periodFormat : period),
      );
      return { ...prev, [type]: { periods: updatedPeriods } };
    });
  };

  useEffect(() => {
    const period = values[type].periods[index];
    setWorkingDays(period.start_date, period.end_date);
  }, [
    values[type].periods[index].start_date,
    values[type].periods[index].end_date,
  ]);

  return (
    <>
      <View
        style={tw`mx-10 border border-[#0d3dff] rounded-lg p-2.5 border-t-[0.3125rem]`}
      >
        <View style={tw`gap-1`}>
          {values[type].periods.length > 1 && (
            <Text style={tw`text-center font-bold`}>
              Period {numberToLetter(index)}
            </Text>
          )}

          <View>
            <Text style={tw`text-sm font-bold mb-1 text-[#333]`}>
              Start Date
            </Text>
            <TouchableOpacity
              style={tw`border border-[#ccc] rounded-md px-2.5 bg-[#fafafa] h-10 flex-row items-center justify-between`}
              onPress={() => setIsStartDateModalVisible(true)}
            >
              <Text>
                {values[type].periods[index].start_date || "Select start date"}
              </Text>
              <Icon name="date-range" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={tw`text-sm font-bold mb-1 text-[#333]`}>End Date</Text>
            <TouchableOpacity
              style={tw`border border-[#ccc] rounded-md px-2.5 bg-[#fafafa] h-10 flex-row items-center justify-between`}
              onPress={() => setIsEndDateModalVisible(true)}
            >
              <Text>
                {values[type].periods[index].end_date || "Select end date"}
              </Text>
              <Icon name="date-range" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={tw`text-sm font-bold mb-1 text-[#333]`}>
              {checkType() ? "Hours" : "Days"}
            </Text>
            <TextInput
              style={tw`border border-[#ccc] rounded-md px-2.5 bg-[#fafafa] h-10`}
              keyboardType="numeric"
              placeholder={`Enter ${checkType() ? "hours" : "days"}`}
              value={values[type].periods[index].daysOrHours}
              onChangeText={(value) => handleChange("daysOrHours", value)}
            />
          </View>
        </View>

        <View
          style={tw`mt-4 p-3 bg-[#eafaf1] border border-[#27ae60] rounded-md`}
        >
          <Text style={tw`text-base text-[#27ae60]`}>
            Total:{" "}
            <Text style={tw`text-base font-bold text-[#27ae60] mt-1`}>
              ₱
              {formatNumber(
                calculate(values[type].periods[index], parent.rate, type),
              )}
            </Text>
          </Text>
        </View>

        <View style={tw`flex-row gap-2.5 mt-2.5`}>
          {values[type].periods.length - 1 == index && (
            <TouchableOpacity onPress={addPeriod}>
              <Text
                style={tw`px-2.5 py-1.5 text-white border rounded-md bg-[#008000] border-[#008000]`}
              >
                Add
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={clearPeriod}>
            <Text
              style={tw`px-2.5 py-1.5 text-white border rounded-md bg-[#f79812ff] border-[#f79812ff]`}
            >
              Clear
            </Text>
          </TouchableOpacity>

          {values[type].periods.length > 1 && (
            <TouchableOpacity onPress={removePeriod}>
              <Text
                style={tw`px-2.5 py-1.5 text-white border rounded-md bg-[#e71414ff] border-[#e71414ff]`}
              >
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isStartDateModalVisible && (
        <DateTimePicker
          value={formatDate(values[type].periods[index].start_date)}
          mode="date"
          onChange={(_, value) => {
            value && handleChange("start_date", value);
          }}
        />
      )}

      {isEndDateModalVisible && (
        <DateTimePicker
          value={formatDate(values[type].periods[index].end_date)}
          mode="date"
          onChange={(_, value) => {
            value && handleChange("end_date", value);
          }}
        />
      )}
    </>
  );
};

export default Form;
