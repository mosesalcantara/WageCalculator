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
        <Text className="text-center font-bold text-white">⚙️ Settings</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4 gap-1.5">
            <View>
              <TouchableOpacity
                className="rounded-[0.625rem]  bg-black p-3"
                onPress={() => router.push("/settings/wage-orders" as Href)}
              >
                <Text className="text-center font-bold text-white">
                  📑 Wage Orders
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                className="rounded-[0.625rem] bg-black p-3"
                onPress={() => router.push("/settings/holidays" as Href)}
              >
                <Text className="text-center font-bold text-white">
                  📅 Holidays
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mt-2 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ViewSettingsModal;
