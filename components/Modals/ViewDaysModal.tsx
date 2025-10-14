import { Holiday, ViolationKeys } from "@/types/globals";
import { validateDateRange } from "@/utils/globals";
import holidaysJSON from "@/utils/holidays.json";
import { eachDayOfInterval, format, parse } from "date-fns";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  startDate: string;
  endDate: string;
  type: ViolationKeys;
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
};

const ViewDaysModal = ({
  startDate,
  endDate,
  type,
  isVisible,
  onToggle,
}: Props) => {
  const getHolidays = () => {
    if (!validateDateRange(startDate, endDate)) {
      return [];
    }

    let specialDays: Holiday[] = [];
    let regularHolidays: Holiday[] = [];

    const dates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    dates.forEach((date) => {
      if (type == "Special Day" || type == "Holiday Pay") {
        const formattedDate = format(date, "yyyy-MM-dd");
        const year = formattedDate.split("-")[0];
        const yearHolidays = holidaysJSON[year as keyof typeof holidaysJSON];
        if (yearHolidays) {
          const holiday = yearHolidays.find(
            (holiday) => formattedDate == holiday.date,
          );
          if (holiday) {
            holiday.type == "Special (Non-Working) Holiday" &&
              specialDays.push(holiday);
            holiday.type == "Regular Holiday" && regularHolidays.push(holiday);
          }
        }
      }
    });

    return type == "Special Day" ? specialDays : regularHolidays;
  };

  const formatDate = (date: string) => {
    return format(parse(date, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy");
  };

  return (
    <>
      <TouchableOpacity onPress={() => onToggle(true)}>
        <Icon name="remove-red-eye" size={20} color="#555" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => onToggle(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="max-h-[70%] w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
            <Text className="mb-3 text-center text-lg font-bold text-white">
              {type == "Special Day"
                ? "Special (Non-Working) Holidays"
                : "Regular Holidays"}
            </Text>

            <ScrollView
              className="mb-2 rounded-md bg-white p-3"
              showsVerticalScrollIndicator={true}
            >
              {getHolidays().map((holiday, index) => (
                <View
                  className="mb-3 border-b border-gray-300 pb-2"
                  key={index}
                >
                  <Text className="text-base font-bold text-[#333]">
                    {index + 1}. {holiday.name}
                  </Text>
                  <Text>{formatDate(holiday.date)}</Text>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => onToggle(false)}
              >
                <Text className="font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ViewDaysModal;
