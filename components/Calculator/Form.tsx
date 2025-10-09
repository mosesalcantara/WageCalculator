import Select from "@/components/Select";
import {
  Employee,
  Establishment,
  ViolationTypes,
  ViolationValues,
} from "@/types/globals";
import {
  calculate,
  daysArray,
  formatDateValue,
  formatNumber,
  getMinimumRate,
  getPeriodFormat,
  numberToLetter,
  validateDateRange,
} from "@/utils/globals";
import holidaysJSON from "@/utils/holidays.json";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eachDayOfInterval, format } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  grandparent: Establishment;
  parent: Employee;
  type: ViolationTypes;
  index: number;
  valuesState: [ViolationValues, Dispatch<SetStateAction<ViolationValues>>];
};

const Form = ({ grandparent, parent, type, index, valuesState }: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useState(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useState(false);
  const [values, setValues] = valuesState;

  const periods = values[type].periods;
  const period = values[type].periods[index];

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

  const getEstimate = (startDate: string, endDate: string) => {
    if (!validateDateRange(startDate, endDate)) {
      return "";
    }

    let workingDays = 0;
    let restDays = 0;
    let specialDays = 0;
    let regularHolidays = 0;

    const dates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    dates.forEach((date) => {
      includedDays.includes(format(date, "EEEE")) && ++workingDays;
      if (type == "Special Day" || type == "Holiday Pay") {
        const formattedDate = format(date, "yyyy-MM-dd");
        const year = formattedDate.split("-")[0];
        const yearHolidays = holidaysJSON[year as keyof typeof holidaysJSON];
        if (yearHolidays) {
          const holiday = yearHolidays.find(
            (holiday) => formattedDate == holiday.date,
          );
          if (holiday) {
            holiday.type == "Regular Holiday" && ++regularHolidays;
            holiday.type == "Special (Non-Working) Holiday" && ++specialDays;
          }
        }
      }
    });

    restDays = dates.length - workingDays;
    if (type == "Basic Wage" || type == "13th Month Pay") {
      return workingDays;
    } else if (type == "Rest Day") {
      return restDays;
    } else if (type == "Special Day") {
      return specialDays;
    } else if (type == "Holiday Pay") {
      return regularHolidays;
    }
    return "";
  };

  const estimate = getEstimate(period.start_date, period.end_date);

  const minimumRate = getMinimumRate(
    period.start_date,
    period.end_date,
    grandparent.size,
  );

  const setRate = () => {
    handleChange("rate", `${parent.rate}`);
  };

  const daysOrHours = ["Overtime Pay", "Night Shift Differential"].includes(
    type,
  )
    ? "Hours"
    : "Days";

  const getLabel = () => {
    if (["Basic Wage", "13th Month Pay"].includes(type)) {
      return "Working Days";
    } else if (type == "Special Day") {
      return "Special Days";
    } else if (type == "Rest Day") {
      return "Rest Days";
    } else if (type == "Holiday Pay") {
      return "Holidays";
    }
  };

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
    handleChange("daysOrHours", estimate);
  }, [estimate]);

  return (
    <>
      <View className="mx-6 rounded-lg border border-t-[0.3125rem] border-[#0d3dff] p-2.5">
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
                className="h-11 flex-row items-center justify-between rounded-md border border-black px-2.5"
                onPress={() => setIsStartDateModalVisible(true)}
              >
                <Text>{period.start_date || "Select date"}</Text>
                <Icon name="date-range" size={20} color="#555" />
              </TouchableOpacity>
            </View>

            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">
                End Date
              </Text>

              <TouchableOpacity
                className="h-11 flex-row items-center justify-between rounded-md border border-black  px-2.5"
                onPress={() => setIsEndDateModalVisible(true)}
              >
                <Text>{period.end_date || "Select date"}</Text>
                <Icon name="date-range" size={20} color="#555" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between gap-1">
            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">Rate</Text>
              <View className="h-11 flex-row items-center  rounded-md border border-black px-2.5">
                <TextInput
                  className="w-[85%]"
                  keyboardType="numeric"
                  placeholder="Enter Rate"
                  placeholderTextColor="black"
                  value={period.rate}
                  onChangeText={(value) => handleChange("rate", value)}
                />
                <Icon
                  name="autorenew"
                  size={20}
                  color="#555"
                  onPress={setRate}
                />
              </View>
            </View>

            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">
                Prevailing Rate
              </Text>
              <TextInput
                className="h-11 rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                keyboardType="numeric"
                placeholder=""
                editable={false}
                value={`${minimumRate == 0 ? "" : minimumRate}`}
              />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between gap-1">
            <View className="w-[49%]">
              <Text className="mb-1 text-base font-bold text-[#333]">
                {daysOrHours}
              </Text>
              <TextInput
                className="h-11 rounded-md border border-black px-2.5"
                keyboardType="numeric"
                placeholder={`Enter ${daysOrHours.toLowerCase()}`}
                placeholderTextColor="black"
                value={period.daysOrHours}
                onChangeText={(value) => handleChange("daysOrHours", value)}
              />
            </View>

            {type == "Overtime Pay" && (
              <View className="w-[49%]">
                <Text className="mb-1 text-base font-bold text-[#333]">
                  Type
                </Text>
                <Select
                  name="type"
                  options={[
                    {
                      label: "Normal Day",
                      value: "Normal Day",
                    },
                    {
                      label: "Rest Day",
                      value: "Rest Day",
                    },
                  ]}
                  placeholder="Select Type"
                  value={period.type}
                  onChange={handleChange}
                />
              </View>
            )}

            {daysOrHours == "Days" && (
              <View className="w-[49%]">
                <Text className="mb-1 text-base font-bold text-[#333]">
                  {getLabel()}
                </Text>
                <TextInput
                  className="h-11 rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                  keyboardType="numeric"
                  placeholder=""
                  editable={false}
                  value={`${estimate}`}
                />
              </View>
            )}
          </View>
        </View>

        <View className="mt-2 rounded-md border border-[#27ae60] bg-[#eafaf1] p-3">
          <Text className="text-base text-[#27ae60]">
            Total:{" "}
            <Text className="mt-1 text-base font-bold text-[#27ae60]">
              ₱{formatNumber(calculate(period, type, grandparent.size))}
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
          value={formatDateValue(period.start_date)}
          mode="date"
          onChange={(_, value) => {
            value && handleChange("start_date", value);
          }}
        />
      )}

      {isEndDateModalVisible && (
        <DateTimePicker
          value={formatDateValue(period.end_date)}
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
