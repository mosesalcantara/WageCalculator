import Select from "@/components/Select";
import { CustomPeriod, CustomViolationType } from "@/types/globals";
import {
  formatDateValue,
  formatNumber,
  numberToLetter,
  typesOptions,
} from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  index: number;
  customViolationType: CustomViolationType;
  calculate: (period: CustomPeriod) => {
    rate: number;
    daysMultiplier: number;
    days: number;
    nightShiftMultiplier: number;
    nightShiftHours: number;
    overtimeMultiplier: number;
    overtimeHours: number;
    total: number;
  };
  onChange: (index: number, key: string, value: string | number | Date) => void;
  onAddPeriod: () => void;
  onClearPeriod: (index: number) => void;
  onRemovePeriod: (index: number) => void;
};

const Form = ({
  index,
  customViolationType,
  calculate,
  onChange,
  onAddPeriod,
  onClearPeriod,
  onRemovePeriod,
}: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useState(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useState(false);

  const periods = customViolationType.periods;
  const period = customViolationType.periods[index];

  const {
    rate,
    daysMultiplier,
    days,
    nightShiftMultiplier,
    nightShiftHours,
    overtimeMultiplier,
    overtimeHours,
    total,
  } = calculate(period);

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
            index={index}
            name="type"
            value={period.type}
            options={typesOptions}
            placeholder="Select Type"
            onChange={onChange}
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
              onChangeText={(value) => onChange(index, "rate", value)}
            />
          </View>

          <View className="w-[49%]">
            <Text className="mb-1 text-base font-bold text-[#333]">Days</Text>
            <TextInput
              className="h-11 rounded-md border border-black px-2.5"
              keyboardType="numeric"
              placeholder="Enter Days"
              value={period.days}
              onChangeText={(value) => onChange(index, "days", value)}
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
              onChangeText={(value) =>
                onChange(index, "nightShiftHours", value)
              }
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
              onChangeText={(value) => onChange(index, "overtimeHours", value)}
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
            <TouchableOpacity onPress={onAddPeriod}>
              <Text className="rounded-md border border-[#008000] bg-[#008000] px-2.5 py-1.5 text-white">
                Add
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onClearPeriod(index)}>
            <Text className="rounded-md border border-[#f79812ff] bg-[#f79812ff] px-2.5 py-1.5 text-white">
              Clear
            </Text>
          </TouchableOpacity>

          {periods.length > 1 && (
            <TouchableOpacity onPress={() => onRemovePeriod(index)}>
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
            if (value) {
              onChange(index, "start_date", value);
              setIsStartDateModalVisible(false);
            }
          }}
        />
      )}

      {isEndDateModalVisible && (
        <DateTimePicker
          value={formatDateValue(period.end_date)}
          mode="date"
          onChange={(_, value) => {
            if (value) {
              onChange(index, "end_date", value);
              setIsEndDateModalVisible(false);
            }
          }}
        />
      )}
    </>
  );
};

export default Form;
