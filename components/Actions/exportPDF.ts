import generateHTML from "@/components/Actions/generateHTML";
import { Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import * as Print from "expo-print"

const exportPDF = async (record: Establishment | undefined) => {
  try {
    const { uri } = await Print.printToFileAsync({
      html: generateHTML(record, false),
    });

    (await Sharing.isAvailableAsync()) && (await Sharing.shareAsync(uri));
  } catch (error) {
    console.error(error);
    Toast.show({
      type: "error",
      text1: "An Error Has Occured. Please Try Again.",
      visibilityTime: toastVisibilityTime,
    });
  }
};

export default exportPDF;
