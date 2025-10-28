import Label from "@/components/Label";
import ViewDaysModal from "@/components/Modals/ViewDaysModal";
import Select from "@/components/PeriodSelect";
import {
  Employee,
  Establishment,
  Holiday,
  ViolationKeys,
  ViolationType,
  WageOrder,
} from "@/types/globals";
import {
  calculate,
  daysArray,
  formatDateValue,
  formatNumber,
  getMinimumRate,
  numberToLetter,
  validateDateRange,
} from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eachDayOfInterval, format } from "date-fns";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  type: ViolationKeys;
  index: number;
  wageOrders: WageOrder[];
  holidays: Holiday[];
  establishment: Establishment;
  employee: Employee;
  violationTypes: Record<ViolationKeys, ViolationType>;
  onChange: (index: number, key: string, value: string | number | Date) => void;
  onAddPeriod: () => void;
  onClearPeriod: (index: number) => void;
  onRemovePeriod: (index: number) => void;
};

const ViolationsForm = ({
  type,
  index,
  wageOrders,
  holidays,
  establishment,
  employee,
  violationTypes,
  onChange,
  onAddPeriod,
  onClearPeriod,
  onRemovePeriod,
}: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useImmer(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useImmer(false);
  const [isViewDaysModalVisible, setIsViewDaysModalVisible] = useImmer(false);

  const periods = violationTypes[type].periods;
  const period = violationTypes[type].periods[index];

  const daysOrHours = ["Overtime Pay", "Night Shift Differential"].includes(
    type,
  )
    ? "Hours"
    : "Days";

  const minimumRate = getMinimumRate(
    wageOrders,
    establishment.size,
    period.start_date,
    period.end_date,
  );

  const getLabel = () => {
    if (["Basic Wage", "13th Month Pay"].includes(type)) {
      return "Working Days";
    } else if (type == "Special Day") {
      return "Special Days";
    } else if (type == "Rest Day") {
      return "Rest Days";
    } else if (type == "Holiday Pay") {
      return "Holidays";
    } else {
      return "";
    }
  };

  const setRate = () => {
    onChange(index, "rate", `${employee.rate}`);
  };

  const setDays = () => {
    onChange(index, "daysOrHours", estimate);
  };

  const handleViewDaysModalToggle = (isVisible: boolean) => {
    setIsViewDaysModalVisible(isVisible);
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

  const includedDays = getIncludedDays(employee.start_day, employee.end_day);

  const getEstimate = (
    holidays: Holiday[],
    startDate: string,
    endDate: string,
  ) => {
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
        const holiday = holidays.find(
          (holiday) => formattedDate == holiday.date,
        );
        if (holiday) {
          holiday.type == "Special (Non-Working) Holiday" && ++specialDays;
          holiday.type == "Regular Holiday" && ++regularHolidays;
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

  const estimate = getEstimate(holidays, period.start_date, period.end_date);

  return (
    <>
      <View className="mx-6 rounded-lg border border-t-[0.3125rem] border-[#0d3dff] bg-white p-2.5">
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

            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Label name="Rate" color="#333" />

                <View className="h-12 flex-row items-center  rounded-md border border-black px-2.5">
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
              {daysOrHours == "Days" ? (
                <View className="w-[49%]">
                  <Label name={daysOrHours} color="#333" />

                  <View className="flex-row items-center  rounded-md border border-black px-2.5">
                    <TextInput
                      className="w-[85%] font-r"
                      keyboardType="numeric"
                      placeholder={`Enter ${daysOrHours.toLowerCase()}`}
                      value={period.daysOrHours}
                      onChangeText={(value) =>
                        onChange(index, "daysOrHours", value)
                      }
                    />
                    {estimate ? (
                      <Icon
                        name="autorenew"
                        size={20}
                        color="#555"
                        onPress={setDays}
                      />
                    ) : null}
                  </View>
                </View>
              ) : (
                <View className="w-[49%]">
                  <Label name={daysOrHours} color="#333" />

                  <TextInput
                    className="rounded-md border border-black px-2.5 font-r"
                    keyboardType="numeric"
                    placeholder={`Enter ${daysOrHours.toLowerCase()}`}
                    value={period.daysOrHours}
                    onChangeText={(value) =>
                      onChange(index, "daysOrHours", value)
                    }
                  />
                </View>
              )}

              {type == "Overtime Pay" && (
                <View className="w-[49%]">
                  <Label name="Type" color="#333" />

                  <Select
                    index={index}
                    name="type"
                    value={period.type}
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
                    onChange={onChange}
                  />
                </View>
              )}

              {daysOrHours == "Days" && (
                <View className="w-[49%]">
                  <Label name={getLabel()} color="#333" />

                  <View className="flex-row items-center rounded-md border border-[#ccc] bg-[#fafafa] px-2.5">
                    <TextInput
                      className="w-[85%] font-r"
                      keyboardType="numeric"
                      placeholder=""
                      editable={false}
                      value={`${estimate}`}
                    />

                    {["Special Day", "Holiday Pay"].includes(type) &&
                      validateDateRange(period.start_date, period.end_date) && (
                        <ViewDaysModal
                          holidays={holidays}
                          type={type}
                          startDate={period.start_date}
                          endDate={period.end_date}
                          isVisible={isViewDaysModalVisible}
                          onToggle={handleViewDaysModalToggle}
                        />
                      )}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View>
            <View className="mt-4 rounded-md border border-[#27ae60] bg-[#eafaf1] p-3">
              <Text className="font-b text-base text-[#27ae60]">
                Total:{" "}
                <Text className="mt-1 font-b text-base text-[#27ae60]">
                  ₱
                  {formatNumber(
                    calculate(wageOrders, type, establishment.size, period),
                  )}
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

export default ViolationsForm;
