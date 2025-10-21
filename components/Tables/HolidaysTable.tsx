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
  const yearsOptions = [
    { label: "All", value: "All" },
    { label: "2018", value: "2018" },
    { label: "2019", value: "2019" },
    { label: "2020", value: "2020" },
    { label: "2021", value: "2021" },
    { label: "2022", value: "2022" },
    { label: "2023", value: "2023" },
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
  ];

  const [year, setYear] = useImmer("All");
  const [isFocus, setIsFocus] = useImmer(false);

  const filteredHolidays = useMemo(() => {
    if (holidays && year) {
      if (year == "All") {
        return holidays;
      }

      return holidays.filter((holiday) => {
        const holidayYear = holiday.date.split("-")[0];
        return year == holidayYear;
      });
    }
  }, [holidays, year]);

  return (
    <>
      <View className="mb-3 h-12 rounded-md border border-[#333] bg-white p-2">
        <Dropdown
          style={{ height: 20 }}
          placeholderStyle={{ fontSize: 14 }}
          selectedTextStyle={{ fontSize: 14 }}
          data={yearsOptions}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? "Select Year" : ""}
          value={year}
          onChange={(option) => {
            setYear(option.value);
            setIsFocus(false);
          }}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false);
          }}
        />
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
                <View>
                  <Text className="text-base font-bold text-[#333]">
                    {index + 1}. {holiday.name}
                  </Text>
                  <Text>{formatDate(holiday.date, "MMMM dd, yyyy")}</Text>
                  <Text className="text-sm text-gray-600">{holiday.type}</Text>
                </View>

                <View className="flex-row items-center">
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
