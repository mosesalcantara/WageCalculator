import NavBar from "@/components/NavBar";
import useFetchEstablishmentViolations from "@/hooks/useFetchEstablishmentViolations";
import { Employee, Period, ViolationValues } from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getDb,
  getMinimumRate,
  getTotal,
  numberToLetter,
  validate
} from "@/utils/globals";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as FileSystem from 'expo-file-system';
import * as Print from "expo-print";
import * as Sharing from 'expo-sharing';
import { Alert, Button, Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";
import * as XLSX from "xlsx";

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

  const getType = (type: string) => {
    let keyword = type;
    if (type == "Basic Wage") {
      keyword = "Wages";
    } else if (type == "Special Day") {
      keyword = "Premium Pay on Special Day";
    } else if (type == "Rest Day") {
      keyword = "Premium Pay on Rest Day";
    }
    return keyword;
  };

  const getDaysOrHours = (type: string, daysOrHours: string) => {
    let keyword = `${daysOrHours} `;
    if (type == "Basic Wage" || type == "Holiday Pay") {
      keyword += "day";
    } else if (type == "Overtime Pay") {
      keyword += "OT hour";
    } else if (type == "Night Shift Differential") {
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
        visibilityTime: toastVisibilityTime,
      });
    }
  };

  const toastVisibilityTime = 2000;

const printToDOCX = async () => {
  try {
    if (!record) {
      Toast.show({
        type: "error",
        text1: "No record data found.",
        visibilityTime: toastVisibilityTime,
      });
      return;
    }

    const buildFormula = (
      type: string,
      rateToUse: number,
      empRate: number,
      period: Period,
      totalNumeric: number,
    ): { expr: string; totalStr: string } => {
      const num = Number(period.daysOrHours) || 1;
      const keyword = getDaysOrHours(type, period.daysOrHours);
      let expr = "";
      switch (type) {
        case "Basic Wage":
          expr = `(Php${formatNumber(rateToUse)} - Php${formatNumber(empRate)}) × ${keyword}`;
          break;
        case "Overtime Pay":
          expr = `Php${formatNumber(rateToUse)} / 8 × 25% × ${keyword}`;
          break;
        case "Night Shift Differential":
          expr = `Php${formatNumber(rateToUse)} / 8 × 10% × ${keyword}`;
          break;
        case "Special Day":
          expr = `Php${formatNumber(rateToUse)} × 30% × ${keyword}`;
          break;
        case "Rest Day":
          expr = `Php${formatNumber(rateToUse)} × 30% × ${keyword}`;
          break;
        case "Holiday Pay":
          expr = `Php${formatNumber(rateToUse)} × ${keyword}`;
          break;
        case "13th Month Pay":
          expr = `Php${formatNumber(rateToUse)} × ${keyword} / 12 months`;
          break;
        default:
          expr = `${keyword} × Php${formatNumber(rateToUse)}`;
      }

      return { expr, totalStr: formatNumber(totalNumeric) };
    };

    const minimumRates = [
      { name: "RB-MIMAROPA-10", date: "2022-06-22", minimum_rate: 355 },
      { name: "RB-MIMAROPA-11", date: "2023-12-07", minimum_rate: 395 },
      { name: "RB-MIMAROPA-12", date: "2024-12-23", minimum_rate: 430 },
    ];

    const docChildren: Paragraph[] = [];

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: record.name ? record.name.toUpperCase() : "EMPLOYEE REPORT",
            bold: true,
            size: 32,
          }),
        ],
        alignment: "center",
        spacing: { after: 400 },
      }),
    );

    (record.employees || []).forEach((emp: Employee, index: number) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${emp.last_name?.toUpperCase()}, ${emp.first_name?.toUpperCase()} ${
                emp.middle_name ? emp.middle_name.charAt(0).toUpperCase() + "." : ""
              }`,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        }),
      );

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Actual Rate: Php${formatNumber(emp.rate)}/day`,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        }),
      );

if (emp.violations && emp.violations.length > 0) {
  const violations = JSON.parse(emp.violations[0].values as string);
  let total = 0;

  Object.keys(violations).forEach((type) => {
    const violationType = violations[type];
    if (!violationType || !violationType.periods || violationType.periods.length === 0) {
      return;
    }
    const validPeriods = violationType.periods.filter((p: any) => validate(p));
    if (validPeriods.length === 0) {
      return;
    }

    let subtotal = 0;

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${type === "Holiday Pay" ? "Non-payment" : "Underpayment"} of ${getType(type)}`,
            bold: true,
            underline: {},
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
    );

          violationType.periods.forEach((period: Period, pIndex: number) => {
            if (!validate(period)) return;

            const result = calculate(period, type, record.size);
            subtotal += result;

            const keyword = getDaysOrHours(type, period.daysOrHours);
            const rateToUse = getMinimumRate(period.start_date, period.end_date, record.size);

            const minRateObj = minimumRates.find((m) => m.minimum_rate === rateToUse);
            const minName = minRateObj ? minRateObj.name : "";

            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Period ${violationType.periods.length > 1 ? ` ${numberToLetter(pIndex)}` : ""}: ${formatDate(
                      period.start_date,
                    )} to ${formatDate(period.end_date)} (${keyword})`,
                    size: 20,
                  }),
                ],
              }),
            );

            if (rateToUse >= emp.rate) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Prevailing Rate: Php${formatNumber(rateToUse)}${minName ? ` (${minName})` : ""}`,
                      italics: true,
                      size: 20,
                    }),
                  ],
                }),
              );
            }

            const { expr, totalStr } = buildFormula(type, rateToUse, emp.rate, period, result);

            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${expr} = `,
                    size: 20,
                  }),
                  new TextRun({
                    text: `Php${totalStr}`,
                    bold: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              }),
            );
          });

          total += subtotal;

          // Subtotal line
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Subtotal: Php${formatNumber(subtotal)}`,
                  bold: true,
                  size: 22,
                }),
              ],
              alignment: "right",
              spacing: { after: 200 },
            }),
          );
        });

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Total: Php${formatNumber(total)}`,
                bold: true,
                size: 24,
              }),
            ],
            alignment: "right",
            spacing: { before: 200, after: 400 },
          }),
        );
      }
    });

    const doc = new Document({ sections: [{ children: docChildren }] });
    const base64 = await Packer.toBase64String(doc);
    const filename = "DOLECalcReport.docx";
    const tempUri = FileSystem.documentDirectory + filename;

    await FileSystem.writeAsStringAsync(tempUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    Alert.alert(
      "Export DOCX",
      "Would you like to Save or Share the file?",
      [
        {
          text: "Save to Device",
          onPress: async () => {
            if (Platform.OS === "android") {
              try {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted && permissions.directoryUri) {
                  const base64File = await FileSystem.readAsStringAsync(tempUri, {
                    encoding: FileSystem.EncodingType.Base64,
                  });

                  const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    filename,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  );

                  await FileSystem.writeAsStringAsync(newFileUri, base64File, {
                    encoding: FileSystem.EncodingType.Base64,
                  });

                  Toast.show({
                    type: "success",
                    text1: "Saved successfully!",
                    visibilityTime: 2000,
                  });
                  console.log("✅ Saved to:", newFileUri);
                }
              } catch (err) {
                console.error("❌ Error saving:", err);
                Toast.show({ type: "error", text1: "Save failed." });
              }
            } else {
              Toast.show({
                type: "info",
                text1: "Save not supported on this platform.",
              });
            }
          },
        },
        {
          text: "Share",
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(tempUri, {
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                dialogTitle: "Share Report",
              });
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  } catch (error) {
    console.error("❌ Error exporting DOCX:", error);
    Toast.show({
      type: "error",
      text1: "An error occurred. Please try again.",
      visibilityTime: 2000,
    });
  }
};



const exportToXLSX = async (): Promise<void> => {
  try {
    if (!record) {
      Toast.show({
        type: "error",
        text1: "No record data found.",
        visibilityTime: 2000,
      });
      return;
    }

    const wsData: any[][] = [
      [
        "#",
        "Full Name",
        "Actual Rate",
        "Violation Type",
        "Period",
        "Formula",
        "Subtotal",
        "Total",
      ],
    ];

    // minimumRates to get RB- names if you want to show them in formula text (optional)
    const minimumRates = [
      { name: "RB-MIMAROPA-10", date: "2022-06-22", minimum_rate: 355 },
      { name: "RB-MIMAROPA-11", date: "2023-12-07", minimum_rate: 395 },
      { name: "RB-MIMAROPA-12", date: "2024-12-23", minimum_rate: 430 },
    ];

    (record.employees || []).forEach((emp: Employee, index: number) => {
      if (!emp.violations || emp.violations.length === 0) return;

      const violations = JSON.parse(emp.violations[0].values as string);
      let employeeTotal = 0;
      let employeeHasData = false;

      Object.keys(violations).forEach((type) => {
        const violationType = violations[type];
        if (!violationType || !violationType.periods || violationType.periods.length === 0) return;

        // filter valid periods
        const validPeriods = (violationType.periods || []).filter((p: Period) => validate(p));
        if (validPeriods.length === 0) return;

        let violationSubtotal = 0;

        // For each valid period create one row
        validPeriods.forEach((period: Period) => {
          // ensure numeric values
          const empRateNum = Number(emp.rate ?? 0);
          const daysOrHoursNum = Number(period.daysOrHours ?? 1);
          const daysOrHoursStr = String(period.daysOrHours ?? "1");
          const rateToUse = Number(getMinimumRate(period.start_date, period.end_date, record.size));
          const formattedRateToUse = formatNumber(rateToUse);
          const keyword = getDaysOrHours(type, daysOrHoursStr); // textual "12 OT hours" etc.

          // The single source of truth for numeric result:
          const numericResult = Number(calculate(period, type, record.size)); // use your existing function
          const resultStr = `₱${formatNumber(numericResult)}`;

          // Build formula text (mirror renderFormula)
          let formulaText = "";
          switch (type) {
            case "Basic Wage":
              // Prevailing - Actual x days
              formulaText = `Php${formattedRateToUse} - Php${formatNumber(empRateNum)} x ${keyword}`;
              break;

            case "Overtime Pay":
            case "Overtime": // accept both variant strings
              formulaText = `Php${formattedRateToUse} / 8 x 25% x ${keyword}`;
              break;

            case "Night Shift Differential":
            case "Night Differential":
              formulaText = `Php${formattedRateToUse} / 8 x 10% x ${keyword}`;
              break;

            case "Special Day":
              formulaText = `Php${formattedRateToUse} x 30% x ${keyword}`;
              break;

            case "Rest Day":
              formulaText = `Php${formattedRateToUse} x 30% x ${keyword}`;
              break;

            case "Holiday Pay":
              formulaText = `Php${formattedRateToUse} x ${keyword}`;
              break;

            case "13th Month Pay":
              formulaText = `Php${formattedRateToUse} x ${keyword} / 12 months`;
              break;

            default:
              formulaText = `Php${formattedRateToUse} x ${keyword}`;
          }

          // If you'd like to append the prevailing rate name (RB-...), do:
          const minRateObj = minimumRates.find((m) => m.minimum_rate === rateToUse);
          const prevailingLabel = minRateObj ? ` ( ${minRateObj.name} )` : "";

          // Period text (include days/hours label and the period dates)
          const periodText = `${formatDate(period.start_date)} to ${formatDate(period.end_date)} (${keyword})`;

          // Push a row for this period:
          wsData.push([
            index + 1,
            `${emp.last_name.toUpperCase()}, ${emp.first_name.toUpperCase()}${
              emp.middle_name ? " " + emp.middle_name.charAt(0).toUpperCase() + "." : ""
            }`,
            `₱${formatNumber(empRateNum)}/day`,
            `${type === "Holiday Pay" ? "Non-payment" : "Underpayment"} of ${getType(type)}`,
            periodText,
            // show formula text (you can include prevailingLabel if you want)
            `${formulaText}${prevailingLabel}`,
            // Computation column: numeric result
            resultStr,
            // Subtotal column left empty per period — subtotal row will be added later
            "",
            "",
          ]);

          violationSubtotal += numericResult;
        });

        // After all periods of this violation type, add a subtotal row for this violation
        if (violationSubtotal > 0) {
          wsData.push(["", "", "", "", "", "", "", `₱${formatNumber(violationSubtotal)}`, ""]);
          employeeTotal += violationSubtotal;
          employeeHasData = true;
        }
      });

      if (employeeHasData) {
        wsData.push(["", "", "", "", "", "", "", `₱${formatNumber(employeeTotal)}`]);
      }
    });

    if (wsData.length === 1) {
      Toast.show({ type: "info", text1: "No valid violations to export.", visibilityTime: 2000 });
      return;
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 5 }, // #
      { wch: 30 }, // Full Name
      { wch: 18 }, // Actual Rate
      { wch: 30 }, // Violation Type
      { wch: 36 }, // Period (made wider)
      { wch: 40 }, // Formula (wider to show expressions)
      { wch: 18 }, // Subtotal
      { wch: 18 }, // Total
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, record.name || "Sheet1");

    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const filename = FileSystem.documentDirectory + "DOLECalcReport.xlsx";

    await FileSystem.writeAsStringAsync(filename, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Save / Share prompt (same as before)
    Alert.alert("Export Excel", "Would you like to Save or Share the file?", [
      {
        text: "Save to Device",
        onPress: async () => {
          if (Platform.OS === "android") {
            try {
              const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

              if (permissions.granted && permissions.directoryUri) {
                const base64File = await FileSystem.readAsStringAsync(filename, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  "DOLECalcReport.xlsx",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                );

                await FileSystem.writeAsStringAsync(newFileUri, base64File, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                Toast.show({ type: "success", text1: "Saved successfully!", visibilityTime: 2000 });
                console.log("✅ Saved to:", newFileUri);
              }
            } catch (err) {
              console.error("❌ Error saving:", err);
              Toast.show({ type: "error", text1: "Save failed.", visibilityTime: 2000 });
            }
          } else {
            Toast.show({ type: "info", text1: "Save not supported on this platform." });
          }
        },
      },
      {
        text: "Share",
        onPress: async () => {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filename, {
              mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              dialogTitle: "Share Excel Report",
            });
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  } catch (error) {
    console.error("❌ Error exporting Excel:", error);
    Toast.show({
      type: "error",
      text1: "An error occurred. Please try again.",
      visibilityTime: 2000,
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
              <Button title="Download/Export PDF" onPress={printToPDF} />
              <View className="h-2.5" />
              <Button title="Download/Export DOCX" onPress={printToDOCX} />
              <View className="h-2.5" />
              <Button title="Download/Export XLSX" onPress={exportToXLSX} />
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default PDFPage;
