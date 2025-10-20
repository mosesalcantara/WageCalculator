import AddWageOrder from "@/components/Modals/AddWageOrder";
import { Holiday } from "@/types/globals";
import holidaysJSON from "@/utils/holidays.json";
import { format, parse } from "date-fns";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useImmer } from "use-immer";

type Props = {
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
};

const [selectedWage, setSelectedWage] = useImmer<Holiday | null>(null);

const WageOrdersPage = ({ isVisible, onToggle }: Props) => {
  const [holidays, setHolidays] = useImmer<Holiday[]>(
    Object.values(holidaysJSON)
      .flat()
      .sort((a, b) => a.date.localeCompare(b.date)),
  );
  const [showDeleteModal, setShowDeleteModal] = useImmer(false);
  const [selectedHoliday, setSelectedHoliday] = useImmer<Holiday | null>(null);

  const formatDate = (date: string) => {
    return format(parse(date, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy");
  };

  const confirmDelete = (wage: Holiday) => {
    setSelectedWage(wage);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!selectedWage) return;

    setHolidays((prev) =>
      prev.filter(
        (h) => !(h.name === selectedWage.name && h.date === selectedWage.date),
      ),
    );
    setShowDeleteModal(false);
    setSelectedWage(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <View className="items-center justify-center bg-black/40">
        <View className="max-h-[100%] w-full bg-[#acb6e2ff] px-4">
          <Text className="mb-3 text-center text-lg font-bold text-white">
            All Wage Orders
          </Text>

          <ScrollView
            className="mb-12 rounded-md bg-white p-3"
            showsVerticalScrollIndicator={true}
          >
            <View className="mb-3 border-b border-gray-300 pb-2">
              <Text className="text-base font-bold text-[#333]">
                RB-MIMAROPA-09
              </Text>
              <Text className="text-base text-[#333]">February 01, 2019</Text>
            </View>
            <View className="mb-3 border-b border-gray-300 pb-2">
              <Text className="text-base font-bold text-[#333]">
                RB-MIMAROPA-10
              </Text>
              <Text className="text-base text-[#333]">June 10, 2022</Text>
            </View>
            <View className="mb-3 border-b border-gray-300 pb-2">
              <Text className="text-base font-bold text-[#333]">
                RB-MIMAROPA-11
              </Text>
              <Text className="text-base text-[#333]">December 07, 2023</Text>
            </View>

            <View className="mb-3 border-b border-gray-300 pb-2">
              <Text className="text-base font-bold text-[#333]">
                RB-MIMAROPA-12
              </Text>
              <Text className="text-base text-[#333]">December 23, 2024</Text>
            </View>
          </ScrollView>
        </View>
      </View>

      <View className="absolute bottom-6 left-6 right-6 mb-6">
        <AddWageOrder />
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

export default WageOrdersPage;
