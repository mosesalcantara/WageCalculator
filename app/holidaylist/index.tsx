import { useState } from "react";
import { Holiday } from "@/types/globals";
import holidaysJSON from "@/utils/holidays.json";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { format, parse } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
import AddHoliday from "@/components/Modals/AddHolidayModal";

type Props = {
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
};

const AllHolidaysPage = ({ isVisible, onToggle }: Props) => {
  const [holidays, setHolidays] = useState<Holiday[]>(
    Object.values(holidaysJSON).flat().sort((a, b) => a.date.localeCompare(b.date))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  const formatDate = (date: string) => {
    return format(parse(date, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy");
  };

  const confirmDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!selectedHoliday) return;

    setHolidays((prev) =>
      prev.filter(
        (h) =>
          !(
            h.name === selectedHoliday.name &&
            h.date === selectedHoliday.date &&
            h.type === selectedHoliday.type
          )
      )
    );
    setShowDeleteModal(false);
    setSelectedHoliday(null);
  };

  const filteredHolidays = holidays.filter(
    (holiday) =>
      holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(holiday.date).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <View className="items-center justify-center bg-black/40">
        <View className="max-h-[100%] bg-[#acb6e2ff] w-full px-4">
          <Text className="mb-3 text-center text-lg font-bold text-white">
            All Holidays
          </Text>

          <View className="flex-row items-center bg-white rounded-full px-3 py-2 mb-3">
            <TextInput
              className="flex-1 ml-2 text-base text-gray-700"
              placeholder="Search by holiday name or date..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Icon name="search" size={24} color="#888" />
          </View>

          <ScrollView
            className="mb-12 rounded-md bg-white p-3"
            showsVerticalScrollIndicator={true}
          >
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday, index) => (
                <View
                  className="mb-3 border-b border-gray-300 pb-2"
                  key={index}
                >
                  <Text className="text-base font-bold text-[#333]">
                    {index + 1}. {holiday.name}
                  </Text>
                  <Text>{formatDate(holiday.date)}</Text>
                  <Text className="italic text-xs text-gray-600">
                    {holiday.type}
                  </Text>

                  <View className="flex-row justify-end space-x-4 mt-1">
                    <TouchableOpacity onPress={() => onToggle(false)}>
                      <Icon name="edit" size={30} color="#2196F3" />
                    </TouchableOpacity>
                    <Text className="self-center text-gray-500 text-[22px]">
                      |
                    </Text>
                    <TouchableOpacity
                      onPress={() => confirmDelete(holiday)}
                    >
                      <Icon name="delete" size={30} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-center text-gray-500">
                No holidays found.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>

      <View className="absolute bottom-6 right-6 left-6 mb-6">
        <AddHoliday />
      </View>

      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-80 p-6 rounded-2xl shadow-lg">
            <Text className="text-lg font-bold text-center text-[#303d78] mb-3">
              Confirm Deletion
            </Text>
            <Text className="text-center text-gray-700 mb-5">
              Are you sure you want to delete{" "}
              <Text className="font-semibold">{selectedHoliday?.name}</Text> on{" "}
              {selectedHoliday ? formatDate(selectedHoliday.date) : ""}?
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-full py-2 mr-2"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-center text-gray-800 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-[#E53935] rounded-full py-2 ml-2"
                onPress={handleDelete}
              >
                <Text className="text-center text-white font-semibold">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AllHolidaysPage;
