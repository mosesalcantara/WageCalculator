import { MaterialIcons } from "@expo/vector-icons";
import { Router } from "expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useImmer } from "use-immer";

type Props = { router: Router };

const ViewSettingsModal = ({ router }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);

  return (
    <>
      <TouchableOpacity
        className="rounded-[1.875rem] bg-black p-3"
        onPress={() => setIsVisible(true)}
      >
        <MaterialIcons name="settings" size={20} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={{ flex: 2, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setIsVisible(false)}
        ></Pressable>

        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="mt-[0%] h-[100%] w-full gap-2 rounded-t-xl bg-primary p-4">
            <View>
              <TouchableOpacity
                className="mt-4 rounded-[0.625rem] border bg-black p-4"
                onPress={() => router.navigate("/settings/wage-orders")}
              >
                <Text className="text-center font-b text-xl text-white">
                  📑 Wage Orders
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                className="mt-1 rounded-[0.625rem] border bg-black p-4"
                onPress={() => router.navigate("/settings/holidays")}
              >
                <Text className="text-center font-b text-xl text-white">
                  📅 Holidays
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-6 gap-3">
              <TouchableOpacity
                className="rounded border bg-white py-3"
                onPress={() => setIsVisible(false)}
              >
                <Text className="text-center font-b text-xl">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ViewSettingsModal;
