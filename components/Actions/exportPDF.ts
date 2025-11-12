import { Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

const exportPDF = async (establishment: Establishment, html: string) => {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    (await Sharing.isAvailableAsync()) &&
      (await Sharing.shareAsync(uri + `${establishment.name}.pdf`));
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
