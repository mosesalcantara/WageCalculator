import exportDOCX from "@/components/Actions/exportDOCX";
import exportPDF from "@/components/Actions/exportPDF";
import exportTest from "@/components/Actions/exportTest";
import exportXLSX from "@/components/Actions/exportXLSX";
import generateHTML from "@/components/Actions/generateHTML";
import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import { getDb } from "@/utils/globals";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const PDFPage = () => {
  const db = getDb();
  const { establishment } = useFetchEstablishmentViolations(db);
  const previewHTML = establishment ? generateHTML(establishment, true) : "";
  const exportHTML = establishment ? generateHTML(establishment, false) : "";

  return (
    <>
      {establishment && (
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
                    onPress={() => exportDOCX(establishment)}
                  >
                    <Text className="text-center font-bold text-white">
                      Export DOCX
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="rounded-[1.875rem] bg-[#2397f3] p-3"
                    onPress={() => exportTest(establishment)}
                  >
                    <Text className="text-center font-bold text-white">
                      Export XLSX
                    </Text>
                  </TouchableOpacity>
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
