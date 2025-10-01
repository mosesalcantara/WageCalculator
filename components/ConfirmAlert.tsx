import { Alert } from "react-native";

const confirmAlert = (
  model: string,
  onDelete: (id: number) => Promise<void>,
  id: number,
) => {
  Alert.alert(
    `Delete ${model}`,
    `Are you sure that you want to delete this ${model}?`,
    [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => onDelete(id) },
    ],
  );
};

export default confirmAlert;
