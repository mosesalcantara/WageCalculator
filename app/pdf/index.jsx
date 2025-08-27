import NavBar from "@/components/NavBar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Button, View } from "react-native";
import { WebView } from "react-native-webview";

const PDF = () => {
  const generateHTML = (isPreview) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Static PDF Preview</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
          }
          p {
            font-size: ${isPreview ? "40px" : "16px"};
            line-height: ${isPreview ? "1.5" : "0.2"};
          }
          .period {
            font-weight: bold;
            float: right;
          }
          .actual {
            font-weight: bold;
            float: right;
          }
        </style>
      </head>
      <body>
        <h1 style="text-align: center; font-size: ${
          isPreview ? "50" : "20"
        }px; font-weight: bold; color: black;">Sample Report</h1>
        <p style="font-weight: bold;">DELA CRUZ, JUAN BINOY</p>
        <p>MINDORO STATE UNIVERSITY -CALAPAN CITY CAMPUS</p><hr>
        <p font-weight: bold;">Actual Rate: Php 430/day</p>
        <p font-weight: bold;"><u>Underpayment of Overtime Pay:</u></p>
        <p>No. of hours: 21 hrs.</p>
        <p>Rate per hour: Php 75.00</p>
        <p>25% additional payment per hour: Php 18.75</p>
        <p>21 hrs x Php 18.75 = <span style="font-weight: bold;">393.75</span></p><br>

        <p>No. of hours: 2 hrs</p>
        <p>Rate per hour: Php 75.00</p>
        <p>30% additional payment per hour: Php 22.50</p>
        <p>2 hrs x Php 22.50 = <span style="font-weight: bold;">45.00</span></p><br>

        <p style="font-weight: bold;"><u>Underpayment of Night Shift Differential</u></p>
        <p>No. of hours: 9 hrs.</p>
        <p>Rate per hour: Php 75.00</p>
        <p>10% additional payment per hour: Php 7.50</p>
        <p>9 hrs x Php 7.50 = <span style="font-weight: bold;">67.50</span></p><br>

        <p style="font-weight: bold;"><u>Underpayment of Premium pay on Special Holiday(2023)</u></p>
        <p>No. of SH: 4 days</p>
        <p>Php 600.00 x 30% x 4 days = <span style="font-weight: bold;">720.00</span></p>

        <p style="font-weight: bold;"><u>Underpayment of Premium pay on Special Holiday(2024)</u></p>
        <p>No. of SH: 5 days before December 23, 2024</p>
        <p>Php 600.00 x 7 days x 30% = <span style="font-weight: bold;">1260.00</span></p>

        <p style="font-weight: bold;"><u>Non-payment of Regular Holiday Pay (2023)</u></p>
        <p>No. of RH: 4 days</p>
        <p>Php 600.00 x 4 days = <span style="font-weight: bold;">2400.00</span></p>

        <p style="font-weight: bold;"><u>Non-payment of Regular Holiday Pay (2024)</u></p>
        <p>No. of RH: 10 days</p>
        <p>Php 600.00 x 10 days = <span style="font-weight: bold;">6000.00</span></p>

        <p style="font-weight: bold;"><u>Non-payment of Regular Holiday Pay (2025)</u></p>
        <p>No. of RH: 1 day</p>
        <p>Php 600.00 x 1 day = <span style="font-weight: bold;">600.00</span></p>
      </body>
    </html>
  `;

  const printToPDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateHTML(false),
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert("PDF saved at: " + uri);
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  return (
    <>
      <NavBar />

      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, marginBottom: 10 }}>
          <WebView source={{ html: generateHTML(true) }} />
        </View>
        <View style={{ marginBottom: 50, paddingHorizontal: 20 }}>
          <Button title="Download/Export PDF" onPress={printToPDF} />
        </View>
      </View>
    </>
  );
};

export default PDF;
