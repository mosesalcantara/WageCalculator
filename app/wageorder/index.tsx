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
import { format, parse } from "date-fns";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import AddWageOrder from "@/components/Modals/AddWageOrder";

type Props = {
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
};

const [selectedWage, setSelectedWage] = useState<Holiday | null>(null);

const WageOrderPage = ({ isVisible, onToggle }: Props) => {
  const [holidays, setHolidays] = useState<Holiday[]>(
    Object.values(holidaysJSON).flat().sort((a, b) => a.date.localeCompare(b.date))
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

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
        (h) =>
          !(
            h.name === selectedWage.name &&
            h.date === selectedWage.date
          )
      )
    );
    setShowDeleteModal(false);
    setSelectedWage(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <View className="items-center justify-center bg-black/40">
        <View className="max-h-[100%] bg-[#acb6e2ff] w-full px-4">
          <Text className="mb-3 text-center text-lg font-bold text-white">
            All Wage Orders
          </Text>

          <ScrollView
            className="mb-12 rounded-md bg-white p-3"
            showsVerticalScrollIndicator={true}
          >
                <View
                  className="mb-3 border-b border-gray-300 pb-2"
                >
                  <Text className="text-base font-bold text-[#333]">
                    RB-MIMAROPA-09
                  </Text>
                  <Text className="text-base text-[#333]">
                    February 01, 2019
                  </Text>
                </View>
                <View
                  className="mb-3 border-b border-gray-300 pb-2"
                >
                  <Text className="text-base font-bold text-[#333]">
                    RB-MIMAROPA-10
                  </Text>
                  <Text className="text-base text-[#333]">
                    June 10, 2022
                  </Text>
                </View>
                <View
                  className="mb-3 border-b border-gray-300 pb-2"
                >
                  <Text className="text-base font-bold text-[#333]">
                    RB-MIMAROPA-11
                  </Text>
                  <Text className="text-base text-[#333]">
                    December 07, 2023
                  </Text>
                </View>

                <View
                  className="mb-3 border-b border-gray-300 pb-2"
                >
                  <Text className="text-base font-bold text-[#333]">
                    RB-MIMAROPA-12
                  </Text>
                  <Text className="text-base text-[#333]">
                    December 23, 2024
                  </Text>
                </View>
          </ScrollView>
        </View>
      </View>

      <View className="absolute bottom-6 right-6 left-6 mb-6">
        <AddWageOrder />
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

export default WageOrderPage;
