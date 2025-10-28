import Label from "@/components/Label";
import Select from "@/components/PeriodSelect";
import {
  CustomPeriod,
  CustomViolationType,
  Employee,
  Establishment,
  WageOrder,
} from "@/types/globals";
import {
  formatDateValue,
  formatNumber,
  getMinimumRate,
  numberToLetter,
  typesOptions,
} from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  index: number;
  wageOrders: WageOrder[];
  establishment: Establishment;
  employee: Employee;
  customViolationType: CustomViolationType;
  calculate: (
    size: string,
    period: CustomPeriod,
  ) => {
    rate: number;
    rateToUse: number;
    daysMultiplier: number;
    days: number;
    nightShiftMultiplier: number;
    nightShiftHours: number;
    overtimeMultiplier: number;
    overtimeHours: number;
    total: number;
  };
  onChange: (
    index: number,
    key: keyof CustomPeriod | string,
    value: string | number | Date,
  ) => void;
  onAddPeriod: () => void;
  onClearPeriod: (index: number) => void;
  onRemovePeriod: (index: number) => void;
};

const CustomViolationsForm = ({
  index,
  wageOrders,
  establishment,
  employee,
  customViolationType,
  calculate,
  onChange,
  onAddPeriod,
  onClearPeriod,
  onRemovePeriod,
}: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useImmer(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useImmer(false);

  const periods = customViolationType.periods;
  const period = customViolationType.periods[index];

  const {
    rate,
    rateToUse,
    daysMultiplier,
    days,
    nightShiftMultiplier,
    nightShiftHours,
    overtimeMultiplier,
    overtimeHours,
    total,
  } = calculate(establishment.size, period);

  const minimumRate = getMinimumRate(
    wageOrders,
    establishment.size,
    period.start_date,
    period.end_date,
  );

  const setRate = () => {
    onChange(index, "rate", `${employee.rate}`);
  };

  return (
    <>
      <View className="mx-4 rounded-lg border border-t-[0.3125rem] border-[#0d3dff] bg-white p-2.5">
        <View>
          {periods.length > 1 && (
            <Text className="mb-3 text-center font-b text-lg">
              Period {numberToLetter(index)}
            </Text>
          )}

          <View className="gap-2">
            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Label name="Start Date" color="#333" />

                <TouchableOpacity
                  className="h-12 flex-row items-center justify-between rounded-md border border-black px-2.5"
                  onPress={() => setIsStartDateModalVisible(true)}
                >
                  <Text className="font-r">
                    {period.start_date || "Select date"}
                  </Text>
                  <Icon name="date-range" size={20} color="#555" />
                </TouchableOpacity>
              </View>

              <View className="w-[49%]">
                <Label name="End Date" color="#333" />

                <TouchableOpacity
                  className="h-12 flex-row items-center justify-between rounded-md border border-black  px-2.5"
                  onPress={() => setIsEndDateModalVisible(true)}
                >
                  <Text className="font-r">
                    {period.end_date || "Select date"}
                  </Text>
                  <Icon name="date-range" size={20} color="#555" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Label name="Type" color="#333" />

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
                <Label name="Rate" color="#333" />

                <View className="flex-row items-center  rounded-md border border-black px-2.5">
                  <TextInput
                    className="w-[85%] font-r"
                    keyboardType="numeric"
                    placeholder="Enter Rate"
                    value={period.rate}
                    onChangeText={(value) => onChange(index, "rate", value)}
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
                <Label name="Prevailing Rate" color="#333" />

                <TextInput
                  className="rounded-md border border-[#ccc] bg-[#fafafa] px-2.5 font-r"
                  keyboardType="numeric"
                  placeholder=""
                  editable={false}
                  value={`${minimumRate == 0 ? "" : minimumRate}`}
                />
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[32%]">
                <Label name="Days" color="#333" />

                <TextInput
                  className="rounded-md border border-black px-2.5 font-r"
                  keyboardType="numeric"
                  placeholder="Enter Days"
                  value={period.days}
                  onChangeText={(value) => onChange(index, "days", value)}
                />
              </View>

              <View className="w-[32%]">
                <Label name="Night Shift" color="#333" />

                <TextInput
                  className="rounded-md border border-black px-2.5 font-r"
                  keyboardType="numeric"
                  placeholder="Enter Hours"
                  value={period.nightShiftHours}
                  onChangeText={(value) =>
                    onChange(index, "nightShiftHours", value)
                  }
                />
              </View>

              <View className="w-[32%]">
                <Label name="Overtime" color="#333" />

                <TextInput
                  className="rounded-md border border-black px-2.5 font-r"
                  keyboardType="numeric"
                  placeholder="Enter Hours"
                  value={period.overtimeHours}
                  onChangeText={(value) =>
                    onChange(index, "overtimeHours", value)
                  }
                />
              </View>
            </View>
          </View>

          <View>
            <View className="mt-4 rounded-md border border-[#27ae60] bg-[#eafaf1] p-3">
              <Text className="font-b text-base text-[#27ae60]">
                ({rateToUse} x {daysMultiplier} x {days}) +{" "}
              </Text>
              <Text className="font-b text-base text-[#27ae60]">
                ({rateToUse} / 8 x {nightShiftMultiplier} x {nightShiftHours}) +
                ({rateToUse} / 8 x {overtimeMultiplier} x {overtimeHours})
              </Text>

              <Text className="font-b text-base text-[#27ae60]">
                Total:{" "}
                <Text className="mt-1 font-b text-base text-[#27ae60]">
                  = ₱{formatNumber(total)}
                </Text>
              </Text>
            </View>

            <View className="mt-2 flex-row gap-2.5">
              {periods.length - 1 == index && (
                <TouchableOpacity onPress={onAddPeriod}>
                  <Text className="rounded-md border border-[#008000] bg-[#008000] px-2.5 py-1.5 font-r text-white">
                    Add
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => onClearPeriod(index)}>
                <Text className="rounded-md border border-[#f79812ff] bg-[#f79812ff] px-2.5 py-1.5 font-r text-white">
                  Clear
                </Text>
              </TouchableOpacity>

              {periods.length > 1 && (
                <TouchableOpacity onPress={() => onRemovePeriod(index)}>
                  <Text className="rounded-md border border-[#e71414ff] bg-[#e71414ff] px-2.5 py-1.5 font-r text-white">
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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

export default CustomViolationsForm;
