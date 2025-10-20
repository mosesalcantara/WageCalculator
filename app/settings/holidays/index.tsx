import AddHoliday from "@/components/Modals/AddHolidayModal";
import { Holiday } from "@/types/globals";
import holidaysJSON from "@/utils/holidays.json";
import { format, parse } from "date-fns";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
};

const AllHolidaysPage = ({ isVisible, onToggle }: Props) => {
  const [holidays, setHolidays] = useImmer<Holiday[]>(
    Object.values(holidaysJSON)
      .flat()
      .sort((a, b) => a.date.localeCompare(b.date)),
  );
  const [searchQuery, setSearchQuery] = useImmer("");
  const [showDeleteModal, setShowDeleteModal] = useImmer(false);
  const [selectedHoliday, setSelectedHoliday] = useImmer<Holiday | null>(null);

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
          ),
      ),
    );
    setShowDeleteModal(false);
    setSelectedHoliday(null);
  };

  const filteredHolidays = holidays.filter(
    (holiday) =>
      holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(holiday.date)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <View className="items-center justify-center bg-black/40">
        <View className="max-h-[100%] w-full bg-[#acb6e2ff] px-4">
          <Text className="mb-3 text-center text-lg font-bold text-white">
            All Holidays
          </Text>

          <View className="mb-3 flex-row items-center rounded-full bg-white px-3 py-2">
            <TextInput
              className="ml-2 flex-1 text-base text-gray-700"
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
                  <Text className="text-xs italic text-gray-600">
                    {holiday.type}
                  </Text>

                  <View className="mt-1 flex-row justify-end space-x-4">
                    <TouchableOpacity onPress={() => onToggle(false)}>
                      <Icon name="edit" size={30} color="#2196F3" />
                    </TouchableOpacity>
                    <Text className="self-center text-[22px] text-gray-500">
                      |
                    </Text>
                    <TouchableOpacity onPress={() => confirmDelete(holiday)}>
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

      <View className="absolute bottom-6 left-6 right-6 mb-6">
        <AddHoliday />
      </View>

      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-80 rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-3 text-center text-lg font-bold text-[#303d78]">
              Confirm Deletion
            </Text>
            <Text className="mb-5 text-center text-gray-700">
              Are you sure you want to delete{" "}
              <Text className="font-semibold">{selectedHoliday?.name}</Text> on{" "}
              {selectedHoliday ? formatDate(selectedHoliday.date) : ""}?
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="mr-2 flex-1 rounded-full bg-gray-300 py-2"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-center font-semibold text-gray-800">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="ml-2 flex-1 rounded-full bg-[#E53935] py-2"
                onPress={handleDelete}
              >
                <Text className="text-center font-semibold text-white">
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
