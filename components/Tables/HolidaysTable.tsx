import confirmAlert from "@/components/ConfirmAlert";
import UpdateHolidayModal from "@/components/Modals/UpdateHolidayModal";
import { Db, Holiday } from "@/types/globals";
import { formatDate } from "@/utils/globals";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  holidays: Holiday[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const HolidaysTable = ({ db, holidays, refetch, onDelete }: Props) => {
  const typeOptions = [
    {
      label: "All",
      value: "All",
    },
    {
      label: "Regular Holiday",
      value: "Regular Holiday",
    },
    {
      label: "Special (Non-Working) Holiday",
      value: "Special (Non-Working) Holiday",
    },
  ];

  const allYears = holidays?.map((holiday) => holiday.date.split("-")[0]);
  const years = [...new Set(allYears)];

  const getOptions = () => {
    const options = [{ label: "All", value: "All" }];
    years.forEach((year) => {
      options.push({ label: year, value: year });
    });
    return options;
  };

  const [type, setType] = useImmer("All");
  const [isTypeFocused, setIsTypeFocused] = useImmer(false);

  const [year, setYear] = useImmer("All");
  const [isYearFocused, setIsYearFocused] = useImmer(false);

  const filteredHolidays = useMemo(() => {
    if (holidays) {
      if (type == "All" && year == "All") {
        return holidays;
      }

      return holidays.filter((holiday) => {
        let isTypeMatched = true;
        let isYearMatched = true;

        if (type != "All") isTypeMatched = type == holiday.type;
        if (year != "All") isYearMatched = year == holiday.date.split("-")[0];

        return isTypeMatched && isYearMatched;
      });
    }
  }, [holidays, type, year]);

  return (
    <>
      <View className="flex-row justify-between">
        <View className="mb-3 h-12 w-[74%] rounded-md border border-[#333] bg-white p-2">
          <Dropdown
            style={{ height: 20 }}
            placeholderStyle={{ fontSize: 14 }}
            selectedTextStyle={{ fontSize: 14 }}
            data={typeOptions}
            labelField="label"
            valueField="value"
            placeholder={!isTypeFocused ? "Select Type" : ""}
            value={type}
            onChange={(option) => {
              setType(option.value);
              setIsTypeFocused(false);
            }}
            onFocus={() => setIsTypeFocused(true)}
            onBlur={() => {
              setIsTypeFocused(false);
            }}
          />
        </View>

        <View className="mb-3 h-12 w-[25%] rounded-md border border-[#333] bg-white p-2">
          <Dropdown
            style={{ height: 20 }}
            placeholderStyle={{ fontSize: 14 }}
            selectedTextStyle={{ fontSize: 14 }}
            data={getOptions()}
            labelField="label"
            valueField="value"
            placeholder={!isYearFocused ? "Select Year" : ""}
            value={year}
            onChange={(option) => {
              setYear(option.value);
              setIsYearFocused(false);
            }}
            onFocus={() => setIsYearFocused(true)}
            onBlur={() => {
              setIsYearFocused(false);
            }}
          />
        </View>
      </View>

      <View className="h-[40rem]">
        <ScrollView
          className="rounded-md bg-white p-3"
          showsVerticalScrollIndicator={true}
        >
          {filteredHolidays && filteredHolidays.length > 0 ? (
            filteredHolidays.map((holiday, index) => (
              <View
                key={index}
                className="flex-row justify-between border-b border-gray-300 py-3"
              >
                <View className="w-[69%]">
                  <Text className="text-nowrap text-base font-bold text-[#333]">
                    {index + 1}. {holiday.name}
                  </Text>
                  <Text>{formatDate(holiday.date, "MMMM dd, yyyy")}</Text>
                  <Text className="text-sm text-gray-600">{holiday.type}</Text>
                </View>

                <View className="w-[29%] flex-row items-center justify-end gap-4">
                  <UpdateHolidayModal
                    db={db}
                    holiday={holiday}
                    refetch={refetch}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      confirmAlert(holiday.id, "Holiday", onDelete)
                    }
                  >
                    <Icon name="delete" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="h-[39rem] items-center justify-center">
              <Text className="font-bold">No Holidays Found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default HolidaysTable;
