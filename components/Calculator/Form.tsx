import { Employee, ViolationTypes, ViolationValues } from "@/types/globals";
import {
  calculate,
  daysArray,
  formatNumber,
  getMinimumRate,
  getPeriodFormat,
  numberToLetter,
} from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eachDayOfInterval, format } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  parent: Employee;
  type: ViolationTypes;
  index: number;
  valuesState: [ViolationValues, Dispatch<SetStateAction<ViolationValues>>];
};

const Form = ({ parent, type, index, valuesState }: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useState(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useState(false);
  const [values, setValues] = valuesState;

  const periods = values[type].periods;
  const period = values[type].periods[index];

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

  const handleInitialChange = (
    key: string,
    value: string | number | Date,
    index: number,
  ) => {
    if (key.endsWith("_date")) {
      value = (value as Date).toISOString().split("T")[0];
    }

    setValues((prev) => {
      const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
        index == periodIndex ? { ...period, [key]: `${value}` } : period,
      );

      return { ...prev, [type]: { ...prev[type], periods: updatedPeriods } };
    });
  };

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
    const workingDays = getWorkingDays(startDate, endDate);
    if (type == "Basic Wage" || type == "13th Month Pay") {
      handleInitialChange("daysOrHours", workingDays, index);
    }
  };

  const minimumRate = getMinimumRate(period.start_date, period.end_date);

  const addPeriod = () => {
    setValues((prev) => {
      return {
        ...prev,
        [type]: {
          periods: [...prev[type].periods, getPeriodFormat(parent.rate)],
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
      const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
        index == periodIndex ? getPeriodFormat() : period,
      );
      return { ...prev, [type]: { periods: updatedPeriods } };
    });
  };

  useEffect(() => {
    const { start_date, end_date } = period;
    if (start_date && end_date) {
      setWorkingDays(start_date, end_date);
    }
  }, [period.start_date, period.end_date]);

  return (
    <>
      <View className="mx-10 rounded-lg border border-t-[0.3125rem] border-[#0d3dff] p-2.5">
        <View className="gap-1">
          {periods.length > 1 && (
            <Text className="text-center font-bold">
              Period {numberToLetter(index)}
            </Text>
          )}

          <View className="flex-row flex-wrap justify-between gap-1">
            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">
                Start Date
              </Text>
              <TouchableOpacity
                className="h-11 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                onPress={() => setIsStartDateModalVisible(true)}
              >
                <Text>{period.start_date || "Select start date"}</Text>
                <Icon name="date-range" size={20} color="#555" />
              </TouchableOpacity>
            </View>

            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">
                End Date
              </Text>
              <TouchableOpacity
                className="h-11 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                onPress={() => setIsEndDateModalVisible(true)}
              >
                <Text>{period.end_date || "Select end date"}</Text>
                <Icon name="date-range" size={20} color="#555" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between gap-1">
            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">
                {checkType() ? "Hours" : "Days"}
              </Text>
              <TextInput
                className="h-11 rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                keyboardType="numeric"
                placeholder={`Enter ${checkType() ? "hours" : "days"}`}
                value={period.daysOrHours}
                onChangeText={(value) => handleChange("daysOrHours", value)}
              />
            </View>

            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">Rate</Text>
              <TextInput
                className="h-11 rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                keyboardType="numeric"
                placeholder="Enter Rate"
                value={period.rate}
                onChangeText={(value) => handleChange("rate", value)}
              />
            </View>
          </View>
        </View>

        <View>
          <Text className="mb-1 text-base font-bold text-[#333]">
            Prevailing Rate
          </Text>
          <TextInput
            className="h-11 rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
            keyboardType="numeric"
            placeholder=""
            editable={false}
            value={`${minimumRate == 0 ? "" : minimumRate}`}
            onChangeText={(value) => handleChange("minimumRate", value)}
          />
        </View>

        <View className="mt-2 rounded-md border border-[#27ae60] bg-[#eafaf1] p-3">
          <Text className="text-base text-[#27ae60]">
            Total:{" "}
            <Text className="mt-1 text-base font-bold text-[#27ae60]">
              ₱{formatNumber(calculate(period, type))}
            </Text>
          </Text>
        </View>

        <View className="mt-2.5 flex-row gap-2.5">
          {periods.length - 1 == index && (
            <TouchableOpacity onPress={addPeriod}>
              <Text className="rounded-md border border-[#008000] bg-[#008000] px-2.5 py-1.5 text-white">
                Add
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={clearPeriod}>
            <Text className="rounded-md border border-[#f79812ff] bg-[#f79812ff] px-2.5 py-1.5 text-white">
              Clear
            </Text>
          </TouchableOpacity>

          {periods.length > 1 && (
            <TouchableOpacity onPress={removePeriod}>
              <Text className="rounded-md border border-[#e71414ff] bg-[#e71414ff] px-2.5 py-1.5 text-white">
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isStartDateModalVisible && (
        <DateTimePicker
          value={formatDate(period.start_date)}
          mode="date"
          onChange={(_, value) => {
            value && handleChange("start_date", value);
          }}
        />
      )}

      {isEndDateModalVisible && (
        <DateTimePicker
          value={formatDate(period.end_date)}
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
