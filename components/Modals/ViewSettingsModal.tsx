import { MaterialIcons } from "@expo/vector-icons";
import { Href, Router } from "expo-router";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useImmer } from "use-immer";

type Props = {
  router: Router;
};

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
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="mt-[120%] h-[40%] w-full gap-2 rounded-t-xl bg-primary p-4">
            <View>
              <TouchableOpacity
                className="rounded-[0.625rem] bg-black p-4 mt-4"
                onPress={() => router.push("/settings/wage-orders" as Href)}
              >
                <Text className="text-center font-b text-white text-xl">
                  📑 Wage Orders
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                className="rounded-[0.625rem] bg-black p-4 mt-4"
                onPress={() => router.push("/settings/holidays" as Href)}
              >
                <Text className="text-center font-b text-white text-xl">
                  📅 Holidays
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mt-4 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-b text-xl">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ViewSettingsModal;
