import { Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";

const getFile = async (filename: string, html: string) => {
  const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });
  const newUri = `${uri.slice(0, uri.lastIndexOf("/"))}/${filename}`;

  await FileSystem.moveAsync({ from: uri, to: newUri });
  return { uri: newUri, base64 };
};

const exportPDF = async (establishment: Establishment, html: string) => {
  const filename = `${establishment.name}.pdf`;
  const { uri, base64 } = await getFile(filename, html);
  const mimeType = "application/pdf";

  if (uri && base64) {
    Alert.alert("Export as PDF", "Would you like to Save or Share the file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: async () => {
          if (Platform.OS === "android") {
            try {
              const permissions =
                await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

              if (permissions.granted && permissions.directoryUri) {
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  filename,
                  mimeType,
                )
                  .then(async (uri) => {
                    await FileSystem.writeAsStringAsync(uri, base64, {
                      encoding: FileSystem.EncodingType.Base64,
                    });
                  })
                  .catch((error) => console.error(error));

                Toast.show({
                  type: "success",
                  text1: "File Saved",
                  visibilityTime: toastVisibilityTime,
                });
              }
            } catch (error) {
              console.error(error);
              Toast.show({
                type: "error",
                text1: "An Error Has Occured. Please Try Again.",
              });
            }
          } else {
            Toast.show({
              type: "info",
              text1: "Saving Not Supported",
            });
          }
        },
      },
      {
        text: "Share",
        onPress: async () => {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: mimeType,
              dialogTitle: "Share PDF Report",
            });
          }
        },
      },
    ]);
  }
};

export default exportPDF;
