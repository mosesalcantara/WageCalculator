import Select from "@/components/Select";
import { CustomPeriod } from "@/types/globals";
import {
  customPeriodFormat,
  formatDateValue,
  formatNumber,
  numberToLetter,
  typesOptions,
} from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dispatch, SetStateAction, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  index: number;
  periodsState: [CustomPeriod[], Dispatch<SetStateAction<CustomPeriod[]>>];
  getTotal: (period: CustomPeriod) => {
    rate: number;
    daysMultiplier: number;
    days: number;
    nightShiftMultiplier: number;
    nightShiftHours: number;
    overtimeMultiplier: number;
    overtimeHours: number;
    total: number;
  };
};

const Form = ({ index, periodsState, getTotal }: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useState(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useState(false);
  const [periods, setPeriods] = periodsState;

  const period = periods[index];

  const handleChange = (key: string, value: string | Date) => {
    if (key.endsWith("_date")) {
      value = (value as Date).toISOString().split("T")[0];
    }

    setPeriods((prev) => {
      const updatedPeriods = prev.map((period, periodIndex) =>
        index == periodIndex ? { ...period, [key]: `${value}` } : period,
      );

      return updatedPeriods;
    });

    if (key == "start_date") {
      setIsStartDateModalVisible(false);
    } else if (key == "end_date") {
      setIsEndDateModalVisible(false);
    }
  };

  const addPeriod = () => {
    setPeriods((prev) => {
      return [...prev, customPeriodFormat];
    });
  };

  const removePeriod = () => {
    setPeriods((prev) => {
      const updatedPeriods = prev;
      updatedPeriods.splice(index, 1);
      return [...updatedPeriods];
    });
  };

  const clearPeriod = () => {
    setPeriods((prev) => {
      const updatedPeriods = prev.map((period, periodIndex) =>
        index == periodIndex ? customPeriodFormat : period,
      );
      return updatedPeriods;
    });
  };

  const {
    rate,
    daysMultiplier,
    days,
    nightShiftMultiplier,
    nightShiftHours,
    overtimeMultiplier,
    overtimeHours,
    total,
  } = getTotal(period);

  return (
    <>
      <View className="mx-4 rounded-lg border border-t-[0.3125rem] border-[#0d3dff] bg-white p-2.5">
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
        </View>
        <View>
          <Text className="mb-1 text-base font-bold text-[#333]">Type</Text>
          <Select
            name="type"
            options={typesOptions}
            placeholder="Select Type"
            value={period.type}
            onChange={handleChange}
          />
        </View>

        <View className="flex-row flex-wrap justify-between gap-1">
          <View className="w-[49%]">
            <Text className="mb-1 text-base font-bold text-[#333]">Rate</Text>
            <TextInput
              className="h-11 rounded-md border border-black px-2.5"
              keyboardType="numeric"
              placeholder="Enter Rate"
              value={period.rate}
              onChangeText={(value) => handleChange("rate", value)}
            />
          </View>

          <View className="w-[49%]">
            <Text className="mb-1 text-base font-bold text-[#333]">Days</Text>
            <TextInput
              className="h-11 rounded-md border border-black px-2.5"
              keyboardType="numeric"
              placeholder="Enter Days"
              value={period.days}
              onChangeText={(value) => handleChange("days", value)}
            />
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between gap-1">
          <View className="w-[49%]">
            <Text className="mb-1 text-base font-bold text-[#333]">
              Night Shift Hours
            </Text>
            <TextInput
              className="h-11 rounded-md border border-black px-2.5"
              keyboardType="numeric"
              placeholder="Enter Hours"
              value={period.nightShiftHours}
              onChangeText={(value) => handleChange("nightShiftHours", value)}
            />
          </View>

          <View className="w-[49%]">
            <Text className="mb-1 text-base font-bold text-[#333]">
              Overtime Hours
            </Text>
            <TextInput
              className="h-11 rounded-md border border-black px-2.5"
              keyboardType="numeric"
              placeholder="Enter Hours"
              value={period.overtimeHours}
              onChangeText={(value) => handleChange("overtimeHours", value)}
            />
          </View>
        </View>

        <View className="mt-2 rounded-md border border-[#27ae60] bg-[#eafaf1] p-3">
          <Text className="text-base font-bold text-[#27ae60]">
            ({rate} x {daysMultiplier} x {days}) +{" "}
          </Text>
          <Text className="text-base font-bold text-[#27ae60]"> 
            ({rate} / 8 x {nightShiftMultiplier} x {nightShiftHours}) + ({rate}{" "}
            / 8 x {overtimeMultiplier} x {overtimeHours})
          </Text>

          <Text className="text-base font-bold text-[#27ae60]">
            Total:{" "}
            <Text className="mt-1 text-base font-bold text-[#27ae60]">
              = ₱{formatNumber(total)}
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
