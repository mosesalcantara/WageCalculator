import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  visibilityState: any;
};

const ViewDaysModal = ({ visibilityState }: Props) => {
  const [isVisible, setIsVisible] = visibilityState;

  return (
    <>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Icon name="remove-red-eye" size={20} color="#555" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="w-4/5 max-h-[70%] rounded-[0.625rem] bg-[#1E90FF] p-4">
            <Text className="mb-3 text-center text-lg font-bold text-white">
              Affected Holidays
            </Text>

            <ScrollView
              className="mb-2 rounded-md bg-white p-3"
              showsVerticalScrollIndicator={true}
            >
              <View className="mb-3 border-b border-gray-300 pb-2">
                <Text className="text-base font-bold text-[#333]">
                  1. Chinese New Year
                </Text>
                <Text>Feb 16, 2018</Text>
              </View>

              <View className="mb-3 border-b border-gray-300 pb-2">
                <Text className="text-base font-bold text-[#333]">
                  2. EDSA People Power Revolution Anniversary
                </Text>
                <Text>Feb 25, 2025</Text>
              </View>

              <View className="mb-3 border-b border-gray-300 pb-2">
                <Text className="text-base font-bold text-[#333]">
                  3. Maundy Thursday
                </Text>
                <Text>Mar 28, 2025</Text>
              </View>

              <View className="mb-3 border-b border-gray-300 pb-2">
                <Text className="text-base font-bold text-[#333]">
                  4. Rizal Day
                </Text>
                <Text>Dec 30, 2025</Text>
              </View>

              <View className="mb-3 border-b border-gray-300 pb-2">
                <Text className="text-base font-bold text-[#333]">
                  5. Bonifacio Day
                </Text>
                <Text>Nov 30, 2025</Text>
              </View>

              <View className="mb-3 border-b border-gray-300 pb-2">
                <Text className="text-base font-bold text-[#333]">
                  6. Ninoy Aquino Day
                </Text>
                <Text>Aug 21, 2025</Text>
              </View>

              <View className="mb-3 border-b border-gray-300 pb-2">
                <Text className="text-base font-bold text-[#333]">
                  7. Eid'l Adha
                </Text>
                <Text>Jun 7, 2025</Text>
              </View>
            </ScrollView>

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
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
