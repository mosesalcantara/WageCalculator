import { Alert, Button, View } from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";

export default function Pdf() {
  const exportPDF = async () => {
    const name = "Karylle V. Macaraig";
    const actualRate = 430;
    const startDate = "August 04, 2025";
    const endDate = "November 06, 2025";
    const days = 46;
    const prevRate = 430;
    const deductionRate = 400;
    const total = (prevRate - deductionRate) * days;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; text-align: center;">
          <div style="width: 350px; border: 1px solid #000; border-radius: 0 0 50px 50px; overflow: hidden; padding-bottom: 20px; margin: auto;">
            <div style="text-align: center; font-weight: bold; padding: 10px 0; border-bottom: 1px solid #000; font-size: 18px;">
              Wage Calculator
            </div>
            <div style="padding: 10px;">
              <table style="width: 100%; margin-bottom: 10px;">
                <tr>
                  <td style="text-align: left;"><img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Department_of_Labor_and_Employment.png" style="width: 80px;" /></td>
                  <td style="text-align: right;"><img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Bagong_Pilipinas_logo.png" style="width: 80px;" /></td>
                </tr>
              </table>

              <p style="font-weight: bold; margin: 5px 0;">${name}</p>
              <p style="margin: 3px 0; font-size: 14px;">Actual Rate: Php ${actualRate}/day</p>
              <p style="margin: 3px 0; font-size: 14px;">Period: ${startDate} – ${endDate} (${days} days)</p>
              <p style="margin: 3px 0; font-size: 14px;">Prevailing Rate: Php ${prevRate.toFixed(
                2
              )} (RB - MIMAROPA-12)</p>
              <p style="margin: 3px 0; font-size: 14px;">Php ${prevRate.toFixed(
                2
              )} – ${deductionRate.toFixed(2)} x ${days} days</p>
              <p style="font-weight: bold; margin-top: 10px;">TOTAL = ${total.toLocaleString()}</p>

              <hr style="border: none; border-top: 1px dashed #555; margin: 10px 0;">

              <p style="font-weight: bold; margin: 5px 0;">${name}</p>
              <p style="margin: 3px 0; font-size: 14px;">Actual Rate: Php ${actualRate}/day</p>
              <p style="margin: 3px 0; font-size: 14px;">Period: ${startDate} – ${endDate} (${days} days)</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      let file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: "wage-calculator",
        directory: "Download",
      });

      Alert.alert("PDF Generated", `Saved at: ${file.filePath}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ marginTop: 50 }}>
      <Button title="Export Wage PDF" onPress={exportPDF} />
    </View>
  );
}
