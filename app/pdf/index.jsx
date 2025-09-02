import NavBar from "@/components/NavBar";
import { establishments } from "@/db/schema";
import {
  calculate,
  formatDate,
  formatNumber,
  getDb,
  getMultiplier,
  getRate,
  numberToLetter,
  validate,
} from "@/utils/utils";
import { eq } from "drizzle-orm";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Alert, Button, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import { WebView } from "react-native-webview";

const PDFPage = () => {
  const db = getDb();

  const [record, setRecord] = useState(null);

  const renderEmployee = (employee, index) => {
    let html = "";

    if (employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values);

      let valid = 0;
      Object.values(violations).forEach((violationType) => {
        violationType.periods.forEach((period) => {
          Object.values(period).every((value) => value) && (valid += 1);
        });
      });

      if (valid > 0) {
        html += `        
            <tr>
                <td>
                ${
                  index + 1
                }. ${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}
                </td>
                <td></td>
            </tr>
            <tr><td>Actual Rate: Php${formatNumber(employee.rate)}/day</td><tr>
            <tr><td>${renderViolations(employee, index)}</td><tr>
          `;
      }
    }

    return html;
  };

  const renderViolations = (employee) => {
    let html = "";

    const violations = JSON.parse(employee.violations[0].values);
    const rate = employee.rate;

    let total = 0;
    Object.keys(violations).forEach((type) => {
      const violationType = violations[type];

      let valid = 0;
      violationType.periods.forEach((period) => {
        validate(period) && (valid += 1);
        total += calculate(period, rate, type);
      });
      violationType.received && (total -= violationType.received);

      valid > 0 &&
        (html += `
          <p font-weight: bold;">
            <u>
            ${
              type == "Holiday Pay" ? "Non-payment" : "Underpayment"
            } of ${getType(type)}
            </u>
          </p>
         
          ${renderViolationType(violations[type], rate, type)}

          <br/>
        `);
    });

    html += `<b><u style="float:right;">Total: Php${formatNumber(total)}</u></b>
             `;

    return html;
  };

  const renderViolationType = (violationType, rate, type) => {
    let html = "";
    let subtotal = 0;
    violationType.periods.forEach((period, index) => {
      if (validate(period)) {
        subtotal += calculate(period, rate, type);
        html += `
        <p>Period${
          violationType.periods.length > 1 ? ` ${numberToLetter(index)}` : ""
        }: ${formatDate(period.start_date)} to ${formatDate(
          period.end_date
        )} (${getDaysOrHours(type, period.daysOrHours)})
        </p>

        ${renderFormula(period, rate, type)}
        `;
      }
    });

    violationType.periods.length > 1 &&
      (html += `
        <p style="text-align:right;">
          Subtotal: Php${formatNumber(subtotal)}
        </p>
      `);

    type == "13th Month Pay" &&
      (html += `
      <p>
        Actual 13th Month Pay Received: 
        Php${formatNumber(violationType.received)}
      </p>

      <p>
        Php${formatNumber(subtotal)} - ${formatNumber(violationType.received)} 
        <span>= Php${formatNumber(subtotal - violationType.received)}</span>
      </p>
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
    if (type == "Basic Wage") {
      keyword += "day";
    } else if ("Overtime Pay") {
      keyword += "OT hour";
    } else if ("Night Differential") {
      keyword += "night-shift hour";
    } else if ("Special Day") {
      keyword += "special day";
    } else if ("Rest Day") {
      keyword += "rest day";
    } else if ("13th Month Pay") {
      keyword += "day";
    }
    daysOrHours > 1 && (keyword += "s");
    return keyword;
  };

  const renderFormula = (period, rate, type) => {
    let html = "";

    const { minimumRate, isBelow, rateToUse } = getRate(
      period.start_date,
      rate
    );

    isBelow &&
      (html += `
        <p>
          Prevailing Rate: Php${formatNumber(rateToUse)} (RB-MIMAROPA-12)
        </p>`);

    const formattedRateToUse = formatNumber(rateToUse);
    const total = formatNumber(calculate(period, rate, type));
    const keyword = getDaysOrHours(type, period.daysOrHours);

    switch (type) {
      case "Basic Wage":
        html += `<p>
                  Php${formattedRateToUse} - ${formatNumber(rate)} x ${keyword} 
                  <span class="value";">= Php${total}</span>
                 </p>`;
        break;
      case "Overtime Pay":
        html += `<p>
                  Php${formattedRateToUse} / 8 x 25% x ${keyword} 
                  <span class="value";">= Php${total}</span>
                 </p>`;
        break;
      case "Night Differential":
        html += `<p>Php${formattedRateToUse} / 8 x 10% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Special Day":
        html += `<p>
                    Php${formattedRateToUse} 
                    ${getMultiplier(period.start_date) == 0.3 ? " x 30% " : ""} 
                    x ${keyword} <span class="value";">= Php${total}</span>
                  </p>`;
        break;
      case "Rest Day":
        html += `<p>Php${formattedRateToUse} x 30% x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "Holiday Pay":
        html += `<p>Php${formattedRateToUse} x ${keyword} <span class="value";">= Php${total}</span></p>`;
        break;
      case "13th Month Pay":
        html += `<p>Php${formattedRateToUse} x ${keyword} / 12 months = Php${total}</p>`;
        break;
      default:
        html += "";
        break;
    }

    return html;
  };

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
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 6px;
          font-size: ${isPreview ? "32" : "12"}px;
        }
        .value {
          font-weight: bold;
          text-align: right;
          float: right;
        }
        h1 {
          text-align: center; 
          font-size: ${isPreview ? "40" : "20"}px;
          font-weight: bold;
          color: black;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>${record.name.toUpperCase()}</h1>

      <table>
        <tbody>
          ${record.employees
            .map(
              (employee, index) => `
              ${renderEmployee(employee, index)}
            `
            )
            .join("")}
        </tbody>
      </table>
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
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "An Error Eccurred");
    }
  };

  useEffect(() => {
    const getRecords = async () => {
      try {
        const id = SessionStorage.getItem("establishment_id");
        const data = await db.query.establishments.findFirst({
          where: eq(establishments.id, id),
          with: { employees: { with: { violations: true } } },
        });
        setRecord(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", error.message || "An Error Eccurred");
      }
    };
    getRecords();
  }, []);

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
