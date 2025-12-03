import { MaterialIcons } from "@expo/vector-icons";
import { Href, Router } from "expo-router";
import { Modal, Text, TouchableOpacity, View, Pressable } from "react-native";
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
        {(() => {
          return (
            <Pressable
              style={{ flex: 3, backgroundColor: "rgba(0,0,0,0.5)" }}
              onPress={() => setIsVisible(false)}
            >
              <Pressable onPress={() => {}} style={{}} />
            </Pressable>
          );
        })()}
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="mt-[0%] h-[140%] w-full gap-2 rounded-t-xl bg-primary p-4">
            <View>
              <TouchableOpacity
                className="mt-4 rounded-[0.625rem] bg-black p-4"
                onPress={() => router.push("/settings/wage-orders" as Href)}
              >
                <Text className="text-center font-b text-xl text-white">
                  📑 Wage Orders
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                className="mt-4 rounded-[0.625rem] bg-black p-4"
                onPress={() => router.push("/settings/holidays" as Href)}
              >
                <Text className="text-center font-b text-xl text-white">
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
