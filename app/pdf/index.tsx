import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import {
  Employee,
  Period,
  ViolationType,
  ViolationValues,
} from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getDb,
  getRate,
  getTotal,
  numberToLetter,
  validate,
} from "@/utils/globals";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Button, View } from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";
import tw from "twrnc";

const PDFPage = () => {
  const db = getDb();

  const { record } = useFetchEstablishmentViolations(db);

  const renderEmployee = (employee: Employee, index: number) => {
    let html = "";

    if (employee.violations && employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values as string);

      let valid = 0;
      Object.values(violations as ViolationValues).forEach((violationType) => {
        violationType.periods.forEach((period) => {
          validate(period) && (valid += 1);
        });
      });

      if (valid > 0) {
        html += `        
            <tr>
                <td>
                  <p>
                    ${
                      index + 1
                    }. ${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}
                  </p>
                  
                  <p>Actual Rate: Php${formatNumber(employee.rate)}/day</p>
                </td>
            </tr>
            <tr><td>${renderViolations(employee)}</td><tr>
          `;
      }
    }

    return html;
  };

  const renderViolations = (employee: Employee) => {
    let html = "";

    if (employee.violations && employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values as string);
      const rate = employee.rate;

      let total = 0;
      Object.keys(violations).forEach((type) => {
        const violationType = violations[type];
        total += getTotal(violationType, rate, type);

        let valid = 0;
        violationType.periods.forEach((period: Period) => {
          validate(period) && (valid += 1);
        });

        valid > 0 &&
          (html += `
          <p class="bold top-space">
            ${
              type == "Holiday Pay" ? "Non-payment" : "Underpayment"
            } of ${getType(type)}
          </p>
         
          ${renderViolationType(violations[type], rate, type)}
        `);
      });

      html += `<p class="bold right">Total: Php${formatNumber(total)}</p>`;
    }

    return html;
  };

  const renderViolationType = (
    violationType: ViolationType & { received?: string },
    rate: number,
    type: string,
  ) => {
    let html = "";
    let subtotal = 0;

    violationType.periods.forEach((period, index) => {
      if (validate(period)) {
        subtotal += calculate(period, rate, type);
        html += `
        <p>Period${
          violationType.periods.length > 1 ? ` ${numberToLetter(index)}` : ""
        }: ${formatDate(period.start_date)} to ${formatDate(
          period.end_date,
        )} (${getDaysOrHours(type, period.daysOrHours)})
        </p>

        ${renderFormula(period, rate, type)}

        ${
          index + 1 != violationType.periods.length
            ? `<p class="space">&nbsp</p>`
            : ""
        }`;
      }
    });

    violationType.periods.length > 1 &&
      (html += `
        <p class="right">
          Subtotal: Php${formatNumber(subtotal)}
        </p>
      `);

    type == "13th Month Pay" &&
      (html += `
      <p>
        Actual 13th Month Pay Received: 
        Php${formatNumber(violationType.received || 0)}
      </p>

      <p>
        Php${formatNumber(subtotal)} - ${formatNumber(
          violationType.received || 0,
        )} 
        <span>= Php${formatNumber(
          subtotal - (Number(violationType.received) || 0),
        )}</span>
      </p>
      `);

    return html;
  };

  const getType = (type: string) => {
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

  const getDaysOrHours = (type: string, daysOrHours: string) => {
    let keyword = `${daysOrHours} `;
    if (type == "Basic Wage") {
      keyword += "day";
    } else if (type == "Overtime Pay") {
      keyword += "OT hour";
    } else if (type == "Night Differential") {
      keyword += "night-shift hour";
    } else if (type == "Special Day") {
      keyword += "special day";
    } else if (type == "Rest Day") {
      keyword += "rest day";
    } else if (type == "13th Month Pay") {
      keyword += "day";
    }
    Number(daysOrHours) > 1 && (keyword += "s");
    return keyword;
  };

  const renderFormula = (period: Period, rate: number, type: string) => {
    let html = "";

    const { isBelow, rateToUse } = getRate(period.start_date, rate);

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
                  <span class="value">= Php${total}</span>
                 </p>`;
        break;
      case "Overtime Pay":
        html += `<p>
                  Php${formattedRateToUse} / 8 x 25% x ${keyword} 
                  <span class="value">= Php${total}</span>
                 </p>`;
        break;
      case "Night Differential":
        html += `<p>Php${formattedRateToUse} / 8 x 10% x ${keyword} <span class="value">= Php${total}</span></p>`;
        break;
      case "Special Day":
        html += `<p>
                    Php${formattedRateToUse} x 30% x ${keyword} <span class="value">= Php${total}</span>
                 </p>`;
        break;
      case "Rest Day":
        html += `<p>Php${formattedRateToUse} x 30% x ${keyword} <span class="value">= Php${total}</span></p>`;
        break;
      case "Holiday Pay":
        html += `<p>Php${formattedRateToUse} x ${keyword} <span class="value">= Php${total}</span></p>`;
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

  const getStyles = (isPreview: boolean) => {
    return `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 1.25rem;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.25rem;
        }
        th, td {
          padding: 0 0.375rem;
          font-size: ${isPreview ? "2" : "0.75"}rem;
        }
        h1 {
          text-align: center; 
          font-size: ${isPreview ? "2.5" : "1.25"}rem;
          font-weight: bold;
          color: black;
          margin-bottom: 1.25rem;
        }
        p {
          margin: 0;
          padding: 0;
        }
        .bold {
          font-weight: bold;
          text-decoration: underline;
        }
        .right {
          text-align: right;
        }
        .space {
          font-size: 5%;
        }
        .top-space {
          margin-top: 2%;
        }
      </style>
    `;
  };

  const generateHTML = (isPreview: boolean) =>
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PDF Preview</title>
        ${getStyles(isPreview)}
      </head>
      <body>
        ${
          record &&
          `<h1>${record.name.toUpperCase()}</h1>

          <table>
            <tbody>
              ${
                record.employees &&
                record.employees
                  .map(
                    (employee, index) => `
                  ${renderEmployee(employee, index)}
                `,
                  )
                  .join("")
              }
            </tbody>
          </table>
          `
        }
      </body>
    </html>
  `;

  const printToPDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateHTML(false),
      });

      (await Sharing.isAvailableAsync()) && (await Sharing.shareAsync(uri));
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
      });
    }
  };

  return (
    <>
      {record && (
        <>
          <NavBar />

          <View style={tw`flex-1 bg-white`}>
            <View style={tw`flex-1 mb-2.5`}>
              <WebView source={{ html: generateHTML(true) }} />
            </View>
            <View style={tw`mb-[3.125rem] px-5`}>
              <Button title="Download/Export PDF" onPress={printToPDF} />
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default PDFPage;
