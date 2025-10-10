import exportDOCX from "@/components/Actions/exportDOCX";
import exportPDF from "@/components/Actions/exportPDF";
import exportXLSX from "@/components/Actions/exportXLSX";
import generateHTML from "@/components/Actions/generateHTML";
import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import { getDb } from "@/utils/globals";
import { Button, View } from "react-native";
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
              <View className="flex-1 mb-16">
                <WebView source={{ html: previewHTML }} />
              </View>

              <View className="absolute bottom-2 w-full">
                <View className="flex-row justify-center gap-2">
                  <Button
                    title="Export PDF"
                    onPress={() => exportPDF(exportHTML)}
                  />
                  <View className="h-2.5" />
                  <Button
                    title="Export DOCX"
                    onPress={() => exportDOCX(record)}
                  />
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
