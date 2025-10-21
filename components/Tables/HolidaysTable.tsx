import confirmAlert from "@/components/ConfirmAlert";
import UpdateHolidayModal from "@/components/Modals/UpdateHolidayModal";
import { Db, Holiday } from "@/types/globals";
import { formatDate } from "@/utils/globals";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  db: Db;
  holidays: Holiday[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const HolidaysTable = ({ db, holidays, refetch, onDelete }: Props) => {
  return (
    <ScrollView
      className="rounded-md bg-white p-3"
      showsVerticalScrollIndicator={true}
    >
      {holidays && holidays.length > 0 ? (
        holidays.map((holiday, index) => (
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
              <UpdateHolidayModal db={db} holiday={holiday} refetch={refetch} />

              <TouchableOpacity
                onPress={() => confirmAlert(holiday.id, "Holiday", onDelete)}
              >
                <Icon name="delete" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View className="h-[41.5rem] items-center justify-center">
          <Text className="font-bold">No Holidays Found</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default HolidaysTable;
