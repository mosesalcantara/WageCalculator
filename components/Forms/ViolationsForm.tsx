import Label from "@/components/Label";
import ViewDaysModal from "@/components/Modals/ViewDaysModal";
import Select from "@/components/PeriodSelect";
import {
  Employee,
  Establishment,
  Holiday,
  PaymentType,
  ViolationType,
  ViolationValues,
  WageOrder,
} from "@/types/globals";
import {
  calculate,
  daysArray,
  formatNumber,
  getMinimumRate,
  isHours,
  numberToLetter,
  parseDate,
  validateDateRange,
} from "@/utils/globals";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eachDayOfInterval, format } from "date-fns";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useImmer } from "use-immer";

type Props = {
  violationType: ViolationType;
  paymentType: PaymentType;
  index: number;
  wageOrders: WageOrder[];
  holidays: Holiday[];
  establishment: Establishment;
  employee: Employee;
  violationValues: ViolationValues;
  onChange: (index: number, key: string, value: string | number | Date) => void;
  onAddPeriod: () => void;
  onClearPeriod: (index: number) => void;
  onRemovePeriod: (index: number) => void;
};

const ViolationsForm = ({
  violationType,
  paymentType,
  index,
  wageOrders,
  holidays,
  establishment,
  employee,
  violationValues,
  onChange,
  onAddPeriod,
  onClearPeriod,
  onRemovePeriod,
}: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useImmer(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useImmer(false);
  const [isViewDaysModalVisible, setIsViewDaysModalVisible] = useImmer(false);

  const periods = violationValues[violationType][paymentType];
  const period = violationValues[violationType][paymentType][index];

  const minimumRate = getMinimumRate(
    wageOrders,
    establishment.size,
    period.start_date,
    period.end_date,
  );

  const getLabel = () => {
    if (["Basic Wage", "13th Month Pay"].includes(violationType))
      return "Working Days";
    else if (violationType === "Special Day") return "Special Days";
    else if (violationType === "Rest Day") return "Rest Days";
    else if (violationType === "Holiday Pay") return "Holidays";
    else return "";
  };

  const setRate = () => onChange(index, "rate", `${employee.rate}`);
  const setDays = () => onChange(index, "days", estimate);

  const handleViewDaysModalToggle = (isVisible: boolean) => {
    setIsViewDaysModalVisible(isVisible);
  };

  const getIncludedDays = (startDay: string, endDay: string) => {
    const included = [];

    let i = daysArray.indexOf(startDay);
    let index = 0;

    while (daysArray[index] !== endDay) {
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
    if (!validateDateRange(startDate, endDate)) return "";

    let workingDays = 0;
    let restDays = 0;
    let specialDays = 0;
    let regularHolidays = 0;

    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    dates.forEach((date) => {
      if (includedDays.includes(format(date, "EEEE"))) ++workingDays;

      if (violationType === "Special Day" || violationType === "Holiday Pay") {
        const formattedDate = format(date, "yyyy-MM-dd");
        const holiday = holidays.find(
          (holiday) => formattedDate === holiday.date,
        );

        if (holiday) {
          if (holiday.type === "Special (Non-Working) Holiday") ++specialDays;
          if (holiday.type === "Regular Holiday") ++regularHolidays;
        }
      }
    });

    restDays = dates.length - workingDays;

    if (violationType === "Basic Wage" || violationType === "13th Month Pay")
      return workingDays;
    else if (violationType === "Rest Day") return restDays;
    else if (violationType === "Special Day") return specialDays;
    else if (violationType === "Holiday Pay") return regularHolidays;
    else return "";
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

                  <MaterialIcons name="date-range" size={20} color="#555" />
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

                  <MaterialIcons name="date-range" size={20} color="#555" />
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

                  <MaterialIcons
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
                  value={`${minimumRate === 0 ? "" : minimumRate}`}
                />
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-1">
              {isHours(violationType) ? (
                <>
                  <View className="w-[49%]">
                    <Label name="Days" color="#333" />

                    <TextInput
                      className="rounded-md border border-black px-2.5 font-r"
                      keyboardType="numeric"
                      placeholder="Enter days"
                      value={period.days}
                      onChangeText={(value) => onChange(index, "days", value)}
                    />
                  </View>

                  <View className="w-[49%]">
                    <Label name="Hours" color="#333" />

                    <TextInput
                      className="rounded-md border border-black px-2.5 font-r"
                      keyboardType="numeric"
                      placeholder="Enter hours"
                      value={period.hours}
                      onChangeText={(value) => onChange(index, "hours", value)}
                    />
                  </View>
                </>
              ) : (
                <View className="w-[49%]">
                  <Label name="Days" color="#333" />

                  <View className="flex-row items-center  rounded-md border border-black px-2.5">
                    <TextInput
                      className="w-[85%] font-r"
                      keyboardType="numeric"
                      placeholder="Enter days"
                      value={period.days}
                      onChangeText={(value) => onChange(index, "days", value)}
                    />

                    {estimate ? (
                      <MaterialIcons
                        name="autorenew"
                        size={20}
                        color="#555"
                        onPress={setDays}
                      />
                    ) : null}
                  </View>
                </View>
              )}

              {!isHours(violationType) && (
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

                    {["Special Day", "Holiday Pay"].includes(violationType) &&
                      validateDateRange(period.start_date, period.end_date) && (
                        <ViewDaysModal
                          holidays={holidays}
                          violationType={violationType}
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

            {violationType === "Overtime Pay" && (
              <View>
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
                      label: "Holiday, Special Day, or Rest Day",
                      value: "Holiday, Special Day, or Rest Day",
                    },
                  ]}
                  placeholder="Select Type"
                  onChange={onChange}
                />
              </View>
            )}

            {paymentType === "Underpayment" && (
              <View className="w-[49%]">
                <Label name="Received" color="#333" />

                <TextInput
                  className="rounded-md border border-black px-2.5 font-r"
                  keyboardType="numeric"
                  placeholder="Enter amount received"
                  value={period.received}
                  onChangeText={(value) => onChange(index, "received", value)}
                />
              </View>
            )}
          </View>

          <View>
            <View className="mt-4 rounded-md border border-[#27ae60] bg-[#eafaf1] p-3">
              <Text className="font-b text-base text-[#27ae60]">
                Total: ₱
                {formatNumber(
                  calculate(
                    wageOrders,
                    violationType,
                    paymentType,
                    establishment.size,
                    period,
                  ),
                )}
              </Text>
            </View>

            <View className="mt-2 flex-row gap-2.5">
              {periods.length - 1 === index && (
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
          value={period.start_date ? parseDate(period.start_date) : new Date()}
          mode="date"
          onChange={(event, value) => {
            if (event.type === "set" && value) {
              onChange(index, "start_date", value);
            }
            setIsStartDateModalVisible(false);
          }}
        />
      )}

      {isEndDateModalVisible && (
        <DateTimePicker
          value={period.end_date ? parseDate(period.end_date) : new Date()}
          mode="date"
          onChange={(event, value) => {
            if (event.type === "set" && value) {
              onChange(index, "end_date", value);
            }
            setIsEndDateModalVisible(false);
          }}
        />
      )}
    </>
  );
};

export default ViolationsForm;
