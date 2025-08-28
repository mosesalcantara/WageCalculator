import NavBar from "@/components/NavBar";
import * as schema from "@/db/schema";
import { establishments } from "@/db/schema";
import {
  formatDate,
  formatNumber,
  getMultiplier,
  getRate,
  numToLetter,
} from "@/utils/utils";
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

  const renderEmployee = (employee, index) => {
    let employeeHtml = "";

    if (employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values);
      let valid = 0;

      Object.keys(violations).forEach((key) => {
        violations[key].inputs.forEach((input) => {
          Object.values(input).every((value) => value) && (valid += 1);
        });
      });

      if (valid > 0) {
        employeeHtml += `        
            <p style="font-weight: bold;">${
              index + 1
            }. ${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}</p>
            <p font-weight: bold;">Actual Rate: Php ${employee.rate.toFixed(
              2
            )}/day</p>
            <hr>

            ${renderViolations(employee, violations)}
          `;
      }
    }

    return employeeHtml;
  };

  const renderViolations = (employee, violations) => {
    let violationsHtml = "";
    const rate = employee.rate;
    let total = 0;

    Object.keys(violations).forEach((key) => {
      total += parseFloat(violations[key].subtotal || 0);
      violations[key].received && (total -= violations[key].received);

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

    violationsHtml += `<p style="text-align:right;"><u>Total: Php${formatNumber(
      total
    )}</u></p>`;

    return violationsHtml;
  };

  const renderViolation = (key, violation, rate) => {
    console.log(violation);

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

    if (violation.inputs.length > 1) {
      violationHtml += `<p style="text-align:right;">Subtotal: Php${formatNumber(
        violation.subtotal
      )}</p>`;
    }

    if (key == "13th Month Pay") {
      violationHtml += `
      <p>Actual 13th Month Pay Received: Php${formatNumber(
        violation.received
      )}</p>
      <p>Php${formatNumber(violation.subtotal)} - ${formatNumber(
        violation.received
      )} <span>= Php${formatNumber(
        violation.subtotal - violation.received
      )}</span></p>
      `;
    }

    return violationHtml;
  };

  const getType = (key) => {
    let keyword = key;

    if (key == "Basic Wage") {
      keyword = "Wages";
    } else if (key == "Night Differential") {
      keyword = "Night Shift Differential";
    } else if (key == "Special Day") {
      keyword = "Premium Pay on Special Day";
    } else if (key == "Rest Day") {
      keyword = "Premium Pay on Rest Day";
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
      case "Special Day":
        keyword += "special day";
        break;
      case "Rest Day":
        keyword += "rest day";
        break;
      case "Holiday Pay":
        keyword += "regular holiday";
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
      case "Special Day":
        formulatHtml += `<p>Php${result.rate.toFixed(2)} ${
          getMultiplier(input.start_date) == 0.3 ? " x 30% " : ""
        } x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Rest Day":
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
        formulatHtml += `
          <p>Php${result.rate.toFixed(
            2
          )} x ${keyword} / 12 months = Php${formatNumber(input.total)}</p>
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
          (employee, index) => `${renderEmployee(employee, index)}`
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
