import { MaterialIcons } from "@expo/vector-icons";
import { RelativePathString, Router } from "expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useImmer } from "use-immer";

import { Establishment } from "@/types/globals";

type Props = {
  router: Router;
  establishment: Establishment;
  refetch: () => void;
};

const ViewCustomConfirmation = ({ router, establishment, refetch }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);

  const setEstablishment = (id: number, route: string) => {
    router.navigate({
      pathname: `/${route}/[id]` as RelativePathString,
      params: { id },
    });
  };

  return (
    <>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <MaterialIcons name="file-download" size={20} color="#2196F3" />
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
            <View className="items-center">
              <Text className="text-l mt-2 text-center font-b text-base text-black">
                Do you want to include the Custom Computation?
              </Text>
              <TouchableOpacity
                className=" mt-2 w-full rounded border bg-white py-3 shadow-md"
                onPress={() => {
                  
                }}
              >
                <Text className="text-center font-b text-base text-black">
                  Yes
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className=" mt-2 w-full rounded border bg-white py-3 shadow-md"
              onPress={() => setEstablishment(establishment.id, "export")}
            >
              <Text className="text-center font-b text-base text-black">
                No
              </Text>
            </TouchableOpacity>

            <View className="mt-6 gap-3">
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
              >
                <Text className="text-center font-b text-l underline">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ViewCustomConfirmation;
