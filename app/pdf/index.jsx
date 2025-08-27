import NavBar from "@/components/NavBar";
import * as schema from "@/db/schema";
import { establishments } from "@/db/schema";
import { numToLetter, formatDate } from "@/utils/utils";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Button, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import { WebView } from "react-native-webview";

const PDFPage = () => {
  const initialDb = useSQLiteContext();
  const db = drizzle(initialDb, { schema });
  const id = SessionStorage.getItem("establishment_id");

  const [record, setRecord] = useState(null);

  const renderViolations = (employee) => {
    let violationsHtml = "";
    const violations = JSON.parse(employee.violations[0].values);
    const rate = employee.rate;

    Object.keys(violations).forEach((key) => {
      let isValid = false;

      violations[key].inputs.forEach((input) => {
        isValid = Object.values(input).every((value) => value);
      });

      if (isValid) {
        violationsHtml += `
          <p font-weight: bold;"><u>${
            key == "Holiday Pay" ? "Non-payment" : "Underpayment"
          } of ${key}</u></p>
         
          ${renderViolation(key, violations[key], rate)}
        `;
      }
    });

    return violationsHtml;
  };

  const renderViolation = (key, violation, rate) => {
    let violationHtml = "";

    violation.inputs.map((input, index) => {
      console.log(input);
      violationHtml += `
        <p>Period${violation.inputs.length > 1 ? numToLetter(index) : ""}: ${
        formatDate(input.start_date)
      } to ${formatDate(input.end_date)} (${input.daysOrHours})</p>

        
      `;
    });

    return violationHtml;
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.establishments.findFirst({
        where: eq(establishments.id, id),
        with: {
          employees: {
            with: {
              violations: true,
            },
          },
        },
      });

      console.log(data);
      setRecord(data);
    };

    getRecords();
  }, []);

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
            font-size: ${isPreview ? "40" : "16"}px;
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
          isPreview ? "47" : "20"
        }px; font-weight: bold; color: black;">${record.name.toUpperCase()}</h1>
        ${record.employees.map(
          (employee, index) =>
            `        
            <p style="font-weight: bold;">${
              index + 1
            }. ${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}</p>
            <p font-weight: bold;">Actual Rate: Php ${employee.rate.toFixed(
              2
            )}/day</p>
            <hr>

            ${renderViolations(employee)}
          `
        )}
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
      {record && (
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
      )}
    </>
  );
};

export default PDFPage;
