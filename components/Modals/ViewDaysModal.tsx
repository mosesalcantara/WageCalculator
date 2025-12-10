import { Holiday, ViolationType } from "@/types/globals";
import { formatDate, validateDateRange } from "@/utils/globals";
import { MaterialIcons } from "@expo/vector-icons";
import { eachDayOfInterval, format } from "date-fns";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  holidays: Holiday[];
  violationType: ViolationType;
  startDate: string;
  endDate: string;
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
};

const ViewDaysModal = ({
  holidays,
  violationType,
  startDate,
  endDate,
  isVisible,
  onToggle,
}: Props) => {
  const getHolidays = () => {
    if (!validateDateRange(startDate, endDate)) return [];

    let specialDays: Holiday[] = [];
    let regularHolidays: Holiday[] = [];

    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    dates.forEach((date) => {
      if (violationType === "Special Day" || violationType === "Holiday Pay") {
        const formattedDate = format(date, "yyyy-MM-dd");
        const holiday = holidays.find(
          (holiday) => formattedDate === holiday.date,
        );

        if (holiday) {
          if (holiday.type === "Special (Non-Working) Holiday") {
            specialDays.push(holiday);
          }
          if (holiday.type === "Regular Holiday") {
            regularHolidays.push(holiday);
          }
        }
      }
    });

    return violationType === "Special Day" ? specialDays : regularHolidays;
  };

  const estimatedHolidays = getHolidays();

  return (
    <>
      {estimatedHolidays.length > 0 && (
        <TouchableOpacity onPress={() => onToggle(true)}>
          <MaterialIcons name="remove-red-eye" size={20} color="#555" />
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => onToggle(false)}
      >
        <TouchableOpacity
          className="flex-2 mt-[0%] h-[65%] bg-black/40"
          onPress={() => onToggle(false)}
        ></TouchableOpacity>
        <View className="flex-1 items-center justify-center bg-black/40">
          <View
            className={`mb-[10%] rounded-t-lg bg-primary p-4 ${
              estimatedHolidays.length <= 1
                ? "mt-[13%] min-h-[33%] w-full"
                : estimatedHolidays.length <= 2
                  ? "mt-[12%] min-h-[36%] w-full"
                  : estimatedHolidays.length <= 3
                    ? "mt-13 min-h-[30%] w-full"
                    : "mb-[7%] h-[170%] max-h-[140%] min-h-[30%] w-full"
            }`}
          >
            <Text className="mb-3 text-center font-b text-lg text-white">
              {violationType === "Special Day"
                ? "Special (Non-Working) Holidays"
                : "Regular Holidays"}
            </Text>

            <ScrollView
              className="rounded-md bg-white p-3"
              showsVerticalScrollIndicator={true}
              scrollEnabled={estimatedHolidays.length > 3}
            >
              {estimatedHolidays.map((holiday, index) => (
                <View
                  className="mb-3 border-b border-gray-300 pb-2"
                  key={index}
                >
                  <Text className="font-b text-base text-[#333]">
                    {index + 1}. {holiday.name}
                  </Text>
                  <Text className="font-r">
                    {formatDate(holiday.date, "MMMM dd, yyyy")}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View className="mt-6 gap-3">
              <TouchableOpacity
                className="w-full rounded border bg-white p-4"
                onPress={() => onToggle(false)}
              >
                <Text className="text-center font-b">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ViewDaysModal;
