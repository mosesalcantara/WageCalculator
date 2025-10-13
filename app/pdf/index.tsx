import exportDOCX from "@/components/Actions/exportDOCX";
import exportPDF from "@/components/Actions/exportPDF";
import generateHTML from "@/components/Actions/generateHTML";
import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import { getDb } from "@/utils/globals";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const PDFPage = () => {
  const db = getDb();
  const { record } = useFetchEstablishmentViolations(db);
  const previewHTML = record ? generateHTML(record, true) : "";
  const exportHTML = record ? generateHTML(record, false) : "";

  return (
    <>
      {record && (
        <>
          <SafeAreaView className="flex-1 bg-white">
            <NavBar className="bg-white" />

            <View className="flex-1">
              <View className="mb-16 flex-1">
                <WebView source={{ html: previewHTML }} />
              </View>

              <View className="absolute bottom-2 w-full">
                <View className="flex-row justify-center gap-2">
                  <TouchableOpacity
                    className="rounded-[1.875rem] bg-[#2397f3] p-3"
                    onPress={() => exportPDF(exportHTML)}
                  >
                    <Text className="text-center font-bold text-white">
                      Export PDF
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="rounded-[1.875rem] bg-[#2397f3] p-3"
                    onPress={() => exportDOCX(record)}
                  >
                    <Text className="text-center font-bold text-white">
                      Export DOCX
                    </Text>
                  </TouchableOpacity>

                  <View className="h-2.5" />
                  {/* <Button
                    title="Export XLSX"
                    onPress={() => exportXLSX(record)}
                  /> */}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default PDFPage;
