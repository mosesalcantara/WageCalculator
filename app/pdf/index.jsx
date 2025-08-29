import NavBar from "@/components/NavBar";
import { establishments } from "@/db/schema";
import {
  formatDate,
  formatNumber,
  getDb,
  getMultiplier,
  getRate,
  numToLetter,
} from "@/utils/utils";
import { eq } from "drizzle-orm";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Button, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import { WebView } from "react-native-webview";
import { calculate } from "../../utils/utils";

const PDFPage = () => {
  const db = getDb();
  const id = SessionStorage.getItem("establishment_id");

  const [record, setRecord] = useState(null);

  const renderEmployee = (employee, index) => {
    let html = "";

    if (employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values);
      let valid = 0;

      Object.keys(violations).forEach((type) => {
        violations[type].periods.forEach((period) => {
          Object.values(period).every((value) => value) && (valid += 1);
        });
      });

      if (valid > 0) {
        html += `        
            <p style="font-weight: bold;">${
              index + 1
            }. ${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}</p>
            <p font-weight: bold;">Actual Rate: Php ${employee.rate.toFixed(
              2
            )}/day</p>
            <hr>

            ${renderViolations(employee)}
          `;
      }
    }

    return html;
  };

  const renderViolations = (employee) => {
    let html = "";

    const violations = JSON.parse(employee.violations[0].values);
    const actualRate = employee.rate;
    let total = 0;

    Object.keys(violations).forEach((type) => {
      const violationType = violations[type];

      violationType.periods.map((_, index) => {
        total += calculate(violations, type, index, actualRate);
      });
      violationType.received && (total -= violationType.received);

      let isValid = false;

      violationType.periods.forEach((period) => {
        isValid = Object.values(period).every((value) => value);
      });

      isValid &&
        (html += `
          <p font-weight: bold;"><u>${
            type == "Holiday Pay" ? "Non-payment" : "Underpayment"
          } of ${getType(type)}</u></p>
         
          ${renderViolation(violations, type, actualRate)}

          <br/>
        `);
    });

    html += `<p style="text-align:right;"><u>Total: Php${formatNumber(
      total
    )}</u></p>`;

    return html;
  };

  const renderViolation = (violations, type, actualRate) => {
    const violationType = violations[type]
    let html = "";
    let subtotal = 0;
    
    violationType.periods.map((period, index) => {
      subtotal += calculate(violations, type, index, actualRate);
      html += `
        <p>Period${
          violationType.periods.length > 1 ? ` ${numToLetter(index)}` : ""
        }: ${formatDate(period.start_date)} to ${formatDate(
        period.end_date
      )} (${getDaysOrHours(type, period.daysOrHours)})</p>
        ${renderFormula(violations, type, index, actualRate)}
      `;
    });

    violationType.periods.length > 1 &&
      (html += `<p style="text-align:right;">Subtotal: Php${formatNumber(
        subtotal
      )}</p>`);

    type == "13th Month Pay" &&
      (html += `
      <p>Actual 13th Month Pay Received: Php${formatNumber(
        violationType.received
      )}</p>
      <p>Php${formatNumber(subtotal)} - ${formatNumber(
        violationType.received
      )} <span>= Php${formatNumber(
        subtotal - violationType.received
      )}</span></p>
      `);

    return html;
  };

  const getType = (type) => {
    let keyword = type;

    if (type == "Basic Wage") {
      keyword = "Wages";
    } else if (type == "Night Differential") {
      keyword = "Night Shift Differential";
    } else if (type == "Special Day") {
      keyword = "Premium Pay on Special Day";
    } else if (type == "Rest Day") {
      keyword = "Premium Pay on Rest Day";
    }

    return keyword;
  };

  const getDaysOrHours = (type, daysOrHours) => {
    let keyword = `${daysOrHours} `;
    switch (type) {
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

  const renderFormula = (violations, type, index, actualRate) => {
    let html = "";
    const period = violations[type].periods[index];
    const result = getRate(period.start_date, actualRate);

    if (result.isBelow) {
      html += `<p>Prevailing Rate: Php${result.rate.toFixed(
        2
      )} (RB-MIMAROPA-12)</p>`;
    }

    const formattedRate = result.rate.toFixed(2);
    const keyword = getDaysOrHours(type, period.daysOrHours);
    const total = formatNumber(calculate(violations, type, index, actualRate));

    switch (type) {
      case "Basic Wage":
        html += `<p>Php${formattedRate} - ${actualRate.toFixed(
          2
        )} x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Overtime Pay":
        html += `<p>Php${formattedRate} / 8 x 25% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Night Differential":
        html += `<p>Php${formattedRate} / 8 x 10% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Special Day":
        html += `<p>Php${formattedRate} ${
          getMultiplier(period.start_date) == 0.3 ? " x 30% " : ""
        } x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Rest Day":
        html += `<p>Php${formattedRate} x 30% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Holiday Pay":
        html += `<p>Php${formattedRate} x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "13th Month Pay":
        html += `
          <p>Php${formattedRate} x ${keyword} / 12 months = Php${total}</p>
          `;
        break;
      default:
        html += "";
        break;
    }

    return html;
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
