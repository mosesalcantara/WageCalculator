import exportDOCX from "@/components/Actions/exportDOCX";
import exportPDF from "@/components/Actions/exportPDF";
import exportXLSX from "@/components/Actions/exportXLSX";
import generateHTML from "@/components/Actions/generateHTML";
import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import { getDb } from "@/utils/globals";
import { Button, View } from "react-native";
import { WebView } from "react-native-webview";

const PDFPage = () => {
  const db = getDb();
  const { record } = useFetchEstablishmentViolations(db);

  return (
    <>
      {record && (
        <>
          <NavBar />

          <View className="flex-1 bg-white">
            <View className="mb-2.5 flex-1">
              <WebView source={{ html: generateHTML(record, true) }} />
            </View>
            <View className="flex-row  justify-around mb-[3.125rem] px-5">
              <Button
                title="Export PDF"
                onPress={() => exportPDF(record)}
              />
              <View className="h-2.5" />
              <Button
                title="Export DOCX"
                onPress={() => exportDOCX(record)}
              />
              <View className="h-2.5" />
              <Button
                title="Export XLSX"
                onPress={() => exportXLSX(record)}
              />
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default PDFPage;
