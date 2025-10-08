import exportDOCX from "@/components/Actions/exportDOCX";
import exportXLSX from "@/components/Actions/exportXLSX";
import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import { Employee, Period, ViolationValues } from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getDaysOrHours,
  getDb,
  getMinimumRate,
  getTotal,
  getViolationKeyword,
  numberToLetter,
  toastVisibilityTime,
  validate,
} from "@/utils/globals";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Button, View } from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";

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
                  ${index + 1}. 
                  ${employee.last_name.toUpperCase()}, 
                  ${employee.first_name.toUpperCase()} 
                  ${employee.middle_name ? employee.middle_name.charAt(0).toUpperCase() + "." : ""}
                </p>
                
                <p>Actual Rate: Php${formatNumber(employee.rate)}/day</p>
              </td>
          </tr>
          <tr><td>${renderViolations(employee)}</td></tr>
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
        total += getTotal(violationType, type, record!.size);

        let valid = 0;
        violationType.periods.forEach((period: Period) => {
          if (validate(period)) {
            valid += 1;
          }
        });

        valid > 0 &&
          (html += `
          <p class="bold top-space">
            ${
              type == "Holiday Pay" ? "Non-payment" : "Underpayment"
            } of ${getViolationKeyword(type)}
          </p>
         
          ${renderViolationType(violations[type], rate, type)}
        `);
      });

      html += `<p class="bold right">Total: Php${formatNumber(total)}</p>`;
    }

    return html;
  };

  const renderViolationType = (
    violationType: { periods: Period[]; received?: string },
    rate: number,
    type: string,
  ) => {
    let html = "";
    let subtotal = 0;

    violationType.periods.forEach((period, index) => {
      const result = calculate(period, type, record!.size);
      if (validate(period)) {
        subtotal += result;
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

  const renderFormula = (period: Period, rate: number, type: string) => {
    let html = "";

    const minimumRates = [
      { name: "RB-MIMAROPA-10", date: "2022-06-22", minimum_rate: 355 },
      { name: "RB-MIMAROPA-11", date: "2023-12-07", minimum_rate: 395 },
      { name: "RB-MIMAROPA-12", date: "2024-12-23", minimum_rate: 430 },
    ];

    const rateToUse = getMinimumRate(
      period.start_date,
      period.end_date,
      record!.size,
    );

    const minimumRate = minimumRates.find((minimumRate) => {
      return minimumRate.minimum_rate == rateToUse;
    });

    rateToUse >= rate &&
      (html += `
        <p>
          Prevailing Rate: Php${formatNumber(rateToUse)} (${minimumRate!.name})
        </p>`);

    const formattedRateToUse = formatNumber(rateToUse);
    const total = formatNumber(calculate(period, type, record!.size));
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
      case "Night Shift Differential":
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
          font-size: 0.5rem;
        }
        .top-space {
            margin-top: 1rem;
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

  const exportPDF = async () => {
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
        visibilityTime: toastVisibilityTime,
      });
    }
  };

  return (
    <>
      {record && (
        <>
          <NavBar />

          <View className="flex-1 bg-white">
            <View className="mb-2.5 flex-1">
              <WebView source={{ html: generateHTML(true) }} />
            </View>
            <View className="mb-[3.125rem] px-5">
              <Button title="Download/Export PDF" onPress={() => exportPDF()} />
              <View className="h-2.5" />
              <Button
                title="Download/Export DOCX"
                onPress={() => exportDOCX(record)}
              />
              <View className="h-2.5" />
              <Button
                title="Download/Export XLSX"
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
