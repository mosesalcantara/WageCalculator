import {
  Employee,
  Establishment,
  Period,
  ViolationValues,
} from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getDaysOrHours,
  getMinimumRate,
  getTotal,
  getViolationKeyword,
  numberToLetter,
  toastVisibilityTime,
  validate,
  wageOrders,
} from "@/utils/globals";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";

const exportDOCX = async (record: Establishment) => {
  const children: Paragraph[] = [];

  const renderEmployee = (employee: Employee, index: number) => {
    if (employee.violations && employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values as string);

      let valid = 0;
      Object.values(violations as ViolationValues).forEach((violationType) => {
        violationType.periods.forEach((period) => {
          validate(period) && (valid += 1);
        });
      });

      if (valid > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${employee.last_name?.toUpperCase()}, ${employee.first_name?.toUpperCase()}${
                  ["NA", "N/A"].includes(employee.middle_initial.toUpperCase())
                    ? ""
                    : ` ${employee.middle_initial.toUpperCase()}.`
                }`,
                bold: true,
                size: 28,
                font: {
                  name: "Arial",
                },
              }),
            ],
          }),
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Actual Rate: Php${formatNumber(employee.rate)}/day`,
                size: 28,
                font: {
                  name: "Arial",
                },
              }),
            ],
            spacing: { after: 200 },
          }),
        );

        renderViolations(employee);
      }
    }
  };

  const renderViolations = (employee: Employee) => {
    if (employee.violations && employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values as string);

      let total = 0;
      Object.keys(violations).forEach((type) => {
        const violationType = violations[type];
        total += getTotal(violationType, type, record.size);

        let valid = 0;
        violationType.periods.forEach((period: Period) => {
          if (validate(period)) {
            valid += 1;
          }
        });

        if (valid > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${type === "Holiday Pay" ? "Non-payment" : "Underpayment"} of ${getViolationKeyword(type)}`,
                  bold: true,
                  underline: {},
                  size: 28,
                  font: {
                    name: "Arial",
                  },
                }),
              ],
              spacing: { before: 200, after: 100 },
            }),
          );
          renderViolationType(violations[type], type);
        }
      });

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Total: Php${formatNumber(total)}`,
              bold: true,
              underline: {},
              size: 28,
              font: {
                name: "Arial",
              },
            }),
          ],
          alignment: "right",
          spacing: { before: 200, after: 400 },
        }),
      );
    }
  };

  const renderViolationType = (
    violationType: { periods: Period[]; received?: string },
    type: string,
  ) => {
    let subtotal = 0;

    violationType.periods.forEach((period, index) => {
      const result = calculate(period, type, record.size);
      if (validate(period)) {
        subtotal += result;

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Period ${violationType.periods.length > 1 ? ` ${numberToLetter(index)}` : ""}: ${formatDate(
                  period.start_date,
                )} to ${formatDate(period.end_date)} (${getDaysOrHours(type, period.daysOrHours)})`,
                size: 28,
                font: {
                  name: "Arial",
                },
              }),
            ],
          }),
        );

        renderFormula(period, type);

        if (index + 1 != violationType.periods.length) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: ``,
                }),
              ],
              spacing: { after: 30 },
            }),
          );
        }
      }
    });

    if (violationType.periods.length > 1) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Subtotal: Php${formatNumber(subtotal)}`,
              size: 28,
              font: {
                name: "Arial",
              },
            }),
          ],
          alignment: "right",
          spacing: { after: 200 },
        }),
      );
    }

    if (type == "13th Month Pay") {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Actual 13th Month Pay Received: Php${formatNumber(violationType.received || 0)}`,
              size: 28,
              font: {
                name: "Arial",
              },
            }),
          ],
        }),
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Php${formatNumber(subtotal)} - ${formatNumber(violationType.received || 0)} = Php${formatNumber(subtotal - (Number(violationType.received) || 0))}`,
              size: 28,
              font: {
                name: "Arial",
              },
            }),
          ],
        }),
      );
    }
  };

  const renderFormula = (period: Period, type: string) => {
    let text = "";

    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(
      period.start_date,
      period.end_date,
      record.size,
    );

    const wageOrder = wageOrders.find((wageOrder) => {
      const key =
        record.size == "Employing 10 or more workers"
          ? "tenOrMore"
          : "lessThanTen";
      return wageOrder.rates[key] == minimumRate;
    });

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Prevailing Rate: Php${formatNumber(minimumRate)} (${wageOrder!.name})`,
            italics: true,
            size: 28,
            font: {
              name: "Arial",
            },
          }),
        ],
      }),
    );

    const formattedRateToUse = formatNumber(Math.max(rate, minimumRate));
    const total = formatNumber(calculate(period, type, record.size));
    const keyword = getDaysOrHours(type, period.daysOrHours);

    switch (type) {
      case "Basic Wage":
        text = `(Php${formattedRateToUse} - Php${formatNumber(period.rate)}) x ${keyword}`;
        break;
      case "Overtime Pay":
        text = `Php${formattedRateToUse} / 8 x ${period.type == "Normal Day" ? "25" : "30"}% x ${keyword}`;
        break;
      case "Night Shift Differential":
        text = `Php${formattedRateToUse} / 8 x 10% x ${keyword}`;
        break;
      case "Special Day":
        text = `Php${formattedRateToUse} x 30% x ${keyword}`;
        break;
      case "Rest Day":
        text = `Php${formattedRateToUse} x 30% x ${keyword}`;
        break;
      case "Holiday Pay":
        text = `Php${formattedRateToUse} x ${keyword}`;
        break;
      case "13th Month Pay":
        text = `Php${formattedRateToUse} x ${keyword} / 12 months`;
        break;
      default:
        text = "";
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${text} = Php${formatNumber(total)}`,
            size: 28,
            font: {
              name: "Arial",
            },
          }),
        ],
        spacing: { after: 100 },
      }),
    );
  };

  const generateDOCX = () => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: record.name.toUpperCase(),
            bold: true,
            size: 32,
            font: {
              name: "Arial",
            },
          }),
        ],
        alignment: "center",
        spacing: { after: 400 },
      }),
    );

    record.employees &&
      record.employees.forEach((employee, index) => {
        renderEmployee(employee, index);
      });
  };

  const exportFile = async () => {
    const doc = new Document({ sections: [{ children: children }] });
    const base64 = await Packer.toBase64String(doc);
    const filename = "DOLECalcReport.docx";
    const tempUri = FileSystem.documentDirectory + filename;

    await FileSystem.writeAsStringAsync(tempUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    Alert.alert("Export DOCX", "Would you like to Save or Share the file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Share",
        onPress: async () => {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(tempUri, {
              mimeType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              dialogTitle: "Share Report",
            });
          }
        },
      },
      {
        text: "Save to Device",
        onPress: async () => {
          if (Platform.OS === "android") {
            try {
              const permissions =
                await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
              if (permissions.granted && permissions.directoryUri) {
                const base64File = await FileSystem.readAsStringAsync(tempUri, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                const newFileUri =
                  await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    filename,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  );

                await FileSystem.writeAsStringAsync(newFileUri, base64File, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                Toast.show({
                  type: "success",
                  text1: "Exported File",
                  visibilityTime: toastVisibilityTime,
                });
              }
            } catch (error) {
              console.error(error);
              Toast.show({
                type: "error",
                text1: "An Error Has Occured. Please Try Again.",
              });
            }
          } else {
            Toast.show({
              type: "info",
              text1: "Save not supported on this platform.",
            });
          }
        },
      },
    ]);
  };

  generateDOCX();
  exportFile();
};

export default exportDOCX;
