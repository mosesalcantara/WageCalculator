import { Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";
import * as XLSX from "xlsx";

const exportTest = async (establishment: Establishment) => {
  const generateFile = async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Violation", "Period", "Formula", "Total"],
    ]);

    worksheet["!cols"] = [{ wch: 30 }, { wch: 36 }, { wch: 40 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet2");

    const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
    const uri = FileSystem.documentDirectory + `${establishment.name}.xlsx`;

    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return uri;
  };

  const exportFile = (uri: string) => {
    Alert.alert("Export Excel", "Would you like to Save or Share the file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Share",
        onPress: async () => {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              dialogTitle: "Share Excel Report",
            });
          }
        },
      },
      {
        text: "Save to Device",
        onPress: async () => {
          if (Platform.OS === "android") {
            try {
              const permissions =
                await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

              if (permissions.granted && permissions.directoryUri) {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                const newUri =
                  await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    `${establishment.name}.xlsx`,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  );

                await FileSystem.writeAsStringAsync(newUri, base64, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                Toast.show({
                  type: "success",
                  text1: "Exported File",
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
    ]);
  };

  const uri = await generateFile();
  exportFile(uri);
};

export default exportTest;
