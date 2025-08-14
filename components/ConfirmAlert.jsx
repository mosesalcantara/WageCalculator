import { Alert } from "react-native";

const confirmAlert = (model, deleteRecord, id) => {
  Alert.alert(
    `Delete ${model}`,
    `Are you sure that you want to delete this ${model}?`,
    [
      { text: "Yes", onPress: () => deleteRecord(id) },
      {
        text: "No",
        style: "cancel",
      },
    ]
  );
};

export default confirmAlert;
