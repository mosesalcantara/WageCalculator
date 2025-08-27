import NavBar from "@/components/NavBar";
import * as schema from "@/db/schema";
import { establishments } from "@/db/schema";
import { formatDate, formatNumber, getRate, numToLetter } from "@/utils/utils";
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

    let total = 0;

    Object.keys(violations).forEach((key) => {
      total += parseFloat(violations[key].subtotal || 0);
      let isValid = false;

      violations[key].inputs.forEach((input) => {
        isValid = Object.values(input).every((value) => value);
      });

      if (isValid) {
        violationsHtml += `
          <p font-weight: bold;"><u>${
            key == "Holiday Pay" ? "Non-payment" : "Underpayment"
          } of ${getType(key)}</u></p>
         
          ${renderViolation(key, violations[key], rate)}

          <br/>
        `;
      }
    });

    violationsHtml += `<p style="text-align:right;"><u>Total: Php${formatNumber(total)}</u></p>`;

    return violationsHtml;
  };

  const renderViolation = (key, violation, rate) => {
    let violationHtml = "";
    violation.inputs.map((input, index) => {
      violationHtml += `
        <p>Period${
          violation.inputs.length > 1 ? ` ${numToLetter(index)}` : ""
        }: ${formatDate(input.start_date)} to ${formatDate(
        input.end_date
      )} (${getDaysOrHours(key, input.daysOrHours)})</p>
        ${renderFormula(key, input, rate)}
      `;
    });

    return violationHtml;
  };

  const getType = (key) => {
    let keyword = key;

    if (key == "Basic Wage") {
      keyword = "Wages";
    } else if (key == "Night Differential") {
      keyword = "Night Shift Differential";
    } else if (key == "Premium Pay") {
      keyword = "Premium Pay on Special Day";
    }

    return keyword;
  };

  const getDaysOrHours = (key, daysOrHours) => {
    let keyword = `${daysOrHours} `;
    switch (key) {
      case "Basic Wage":
        keyword += "day";
        break;
      case "Overtime Pay":
        keyword += "OT hour";
        break;
      case "Night Differential":
        keyword += "night-shift hour";
        break;
      case "Premium Pay":
        keyword += "special day";
        break;
      case "Holiday Pay":
        keyword += "regular holiday";
        break;
      case "Premium Pay":
        keyword += "special day";
        break;
      case "13th Month Pay":
        keyword += "day";
        break;
    }
    daysOrHours > 1 && (keyword += "s");
    return keyword;
  };

  const renderFormula = (key, input, actualRate) => {
    let formulatHtml = "";
    const result = getRate(input.start_date, actualRate);
    console.log(result);
    if (result.isBelow) {
      formulatHtml += `<p>Prevailing Rate: Php${result.rate.toFixed(
        2
      )} (RB-MIMAROPA-12)</p>`;
    }

    let keyword = getDaysOrHours(key, input.daysOrHours);
    let total = formatNumber(input.total);

    switch (key) {
      case "Basic Wage":
        formulatHtml += `<p>Php${result.rate.toFixed(2)} - ${actualRate.toFixed(
          2
        )} x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Overtime Pay":
        formulatHtml += `<p>Php${result.rate.toFixed(
          2
        )} / 8 x 25% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Night Differential":
        formulatHtml += `<p>Php${result.rate.toFixed(
          2
        )} / 8 x 10% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Premium Pay":
        formulatHtml += `<p>Php${result.rate.toFixed(
          2
        )} x 30% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Holiday Pay":
        formulatHtml += `<p>Php${result.rate.toFixed(
          2
        )} x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "13th Month Pay":
        const total13thMonth = formatNumber(
          parseFloat(input.total) + parseFloat(input.received)
        );
        const received = formatNumber(input.received);

        formulatHtml += `
          <p>Php${result.rate.toFixed(
            2
          )} x ${keyword} / 12 months = Php${total13thMonth}</p>
          <p>Actual 13th month pay received: Php${received}</p>
          <p>Php ${total13thMonth} - ${received} = Php${formatNumber(
          input.total
        )}</p>
          `;
        break;
      default:
        formulatHtml += "";
        break;
    }

    return formulatHtml;
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
          .value{
              float: right;
              font-weight: bold;
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
