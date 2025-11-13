import exportDOCX from "@/components/Actions/exportDOCX";
import exportPDF from "@/components/Actions/exportPDF";
import exportXLSX from "@/components/Actions/exportXLSX";
import generateHTML from "@/components/Actions/generateHTML";
import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import useFetchWageOrders from "@/hooks/useFetchWageOrders";
import { getDb } from "@/utils/globals";
import { useSQLiteContext } from "expo-sqlite";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const ExportPage = () => {
  const db = getDb(useSQLiteContext());

  const { wageOrders } = useFetchWageOrders(db);
  const { establishment } = useFetchEstablishmentViolations(db);

  const previewHTML = establishment
    ? generateHTML(wageOrders || [], establishment, true)
    : "";
  const exportHTML = establishment
    ? generateHTML(wageOrders || [], establishment, false)
    : "";

  return (
    <>
      {wageOrders && establishment && (
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
                    onPress={() => exportPDF(establishment, exportHTML)}
                  >
                    <Text className="text-center font-b text-white">
                      Export PDF
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="rounded-[1.875rem] bg-[#2397f3] p-3"
                    onPress={() => exportDOCX(wageOrders, establishment)}
                  >
                    <Text className="text-center font-b text-white">
                      Export Word
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="rounded-[1.875rem] bg-[#2397f3] p-3"
                    onPress={() => exportXLSX(wageOrders, establishment)}
                  >
                    <Text className="text-center font-b text-white">
                      Export Excel
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

export default ExportPage;
