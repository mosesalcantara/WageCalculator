import { Modal, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  visibilityState: any;
};

const ViewDaysModal = ({ visibilityState }: Props) => {
  const [isVisible, setIsVisible] = visibilityState;

  return (
    <>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Icon name="remove-red-eye" size={20} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]">
                <Text className="font-bold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ViewDaysModal;
