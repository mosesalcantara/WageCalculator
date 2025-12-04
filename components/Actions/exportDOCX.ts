import {
  Employee,
  Establishment,
  Period,
  ViolationKey,
  ViolationType,
  WageOrder,
} from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getMinimumRate,
  getTotal,
  getValueKeyword,
  getViolationKeyword,
  isHours,
  numberToLetter,
  toastVisibilityTime,
  validate,
} from "@/utils/globals";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";

const exportDOCX = async (
  wageOrders: WageOrder[],
  establishment: Establishment,
) => {
  const filename = `${establishment.name}.docx`;
  const children: Paragraph[] = [];

  const renderEmployee = (index: number, employee: Employee) => {
    if (employee.violations && employee.violations.length > 0) {
      const violations: Record<ViolationKey, ViolationType> = JSON.parse(
        employee.violations[0].values as string,
      );

      let valid = 0;
      Object.keys(violations).forEach((key) => {
        const type = key as ViolationKey;
        violations[type].periods.forEach((period) => {
          if (validate(period, isHours(type) ? [] : ["hours"])) ++valid;
        });
      });

      if (valid > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}${
                  ["na", "n/a"].includes(employee.middle_initial.toLowerCase())
                    ? ""
                    : ` ${employee.middle_initial.toUpperCase()}.`
                }`,
                font: { name: "Arial" },
                size: 28,
                bold: true,
                break: index === 0 ? 0 : 1,
              }),
            ],
          }),
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Actual Rate: Php${formatNumber(employee.rate)}/day`,
                font: { name: "Arial" },
                size: 28,
              }),
            ],
          }),
        );

        renderViolations(employee);
      }
    }
  };

  const renderViolations = (employee: Employee) => {
    if (employee.violations && employee.violations.length > 0) {
      const violations: Record<ViolationKey, ViolationType> = JSON.parse(
        employee.violations[0].values as string,
      );

      let total = 0;
      Object.keys(violations).forEach((key) => {
        const type = key as ViolationKey;
        const violationType = violations[type];
        total += getTotal(wageOrders, type, establishment.size, violationType);

        let valid = 0;
        violationType.periods.forEach((period: Period) => {
          if (validate(period, isHours(type) ? [] : ["hours"])) {
            valid += 1;
          }
        });

        if (valid > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${
                    !violationType.received || violationType.received === "0"
                      ? "Non-payment"
                      : "Underpayment"
                  } of ${getViolationKeyword(type)}`,
                  font: { name: "Arial" },
                  size: 28,
                  bold: true,
                  underline: {},
                  break: 1,
                }),
              ],
            }),
          );
          renderViolationType(type, violations[type]);
        }
      });

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Total: Php${formatNumber(total)}`,
              font: { name: "Arial" },
              size: 28,
              bold: true,
            }),
          ],
          alignment: "right",
        }),
      );
    }
  };

  const renderViolationType = (
    type: ViolationKey,
    violationType: { periods: Period[]; received: string },
  ) => {
    let subtotal = 0;
    const received = Number(violationType.received) || 0;

    violationType.periods.forEach((period, index) => {
      const result = calculate(wageOrders, type, establishment.size, period);

      if (validate(period, isHours(type) ? [] : ["hours"])) {
        subtotal += result;
        const value = isHours(type)
          ? `${Number(period.days) * Number(period.hours)}`
          : `${period.days}`;

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Period${violationType.periods.length > 1 ? ` ${numberToLetter(index)}` : ""}: ${formatDate(
                  period.start_date,
                  "dd MMMM yyyy",
                )} to ${formatDate(period.end_date, "dd MMMM yyyy")} (${value} ${getValueKeyword(type, period.days, period.hours)})`,
                font: { name: "Arial" },
                size: 28,
              }),
            ],
          }),
        );

        const addSpace =
          index + 1 !== violationType.periods.length ||
          (index + 1 === violationType.periods.length && received > 0);

        renderFormula(type, period, addSpace);
      }
    });

    if (received > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Actual Pay Received: Php${formatNumber(received)}`,
              font: { name: "Arial" },
              size: 28,
            }),
          ],
        }),
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Php${formatNumber(subtotal)} - ${formatNumber(received)} = Php${formatNumber(subtotal - received)}`,
              font: { name: "Arial" },
              size: 28,
            }),
          ],
        }),
      );
    }

    if (violationType.periods.length > 1) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Subtotal: Php${formatNumber(subtotal - received)}`,
              font: { name: "Arial" },
              size: 28,
            }),
          ],
          alignment: "right",
        }),
      );
    }
  };

  const renderFormula = (
    type: ViolationKey,
    period: Period,
    addSpace: boolean,
  ) => {
    let text = "";

    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(
      wageOrders,
      establishment.size,
      period.start_date,
      period.end_date,
    );

    const wageOrder = wageOrders.find((wageOrder) => {
      const key =
        establishment.size === "Employing 10 or more workers"
          ? "ten_or_more"
          : "less_than_ten";
      return wageOrder[key] === minimumRate;
    });

    if (wageOrder) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Prevailing Rate: Php${formatNumber(minimumRate)} (${wageOrder.name})`,
              font: { name: "Arial" },
              size: 28,
            }),
          ],
        }),
      );
    }

    const formattedRateToUse = formatNumber(Math.max(rate, minimumRate));
    const total = formatNumber(
      calculate(wageOrders, type, establishment.size, period),
    );
    const keyword = getValueKeyword(type, period.days, period.hours);

    switch (type) {
      case "Basic Wage":
        text = `Php${formatNumber(minimumRate)} - Php${formatNumber(period.rate)} x ${period.days} ${keyword}`;
        break;
      case "Overtime Pay":
        text = `Php${formattedRateToUse} / 8 x ${period.type === "Normal Day" ? "125" : "130"}% x ${period.days} day${Number(period.days) === 1 ? "" : "s"} x ${period.hours} ${keyword}`;
        break;
      case "Night Shift Differential":
        text = `Php${formattedRateToUse} / 8 x 10% x ${period.days} x ${period.hours} ${keyword}`;
        break;
      case "Special Day":
        text = `Php${formattedRateToUse} x 30% x ${period.days} ${keyword}`;
        break;
      case "Rest Day":
        text = `Php${formattedRateToUse} x 30% x ${period.days} ${keyword}`;
        break;
      case "Holiday Pay":
        text = `Php${formattedRateToUse} x ${period.days} ${keyword}`;
        break;
      case "13th Month Pay":
        text = `Php${formattedRateToUse} x ${period.days} ${keyword} / 12 months`;
        break;
      default:
        text = "";
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${text} = Php${total}`,
            font: { name: "Arial" },
            size: 28,
          }),
        ],
        spacing: { after: addSpace ? 300 : 0 },
      }),
    );
  };

  const generateDOCX = () => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: establishment.name.toUpperCase(),
            font: { name: "Arial" },
            size: 32,
            bold: true,
          }),
        ],
        alignment: "center",
        spacing: { after: 400 },
      }),
    );

    if (establishment.employees) {
      establishment.employees.forEach((employee, index) => {
        renderEmployee(index, employee);
      });
    }
  };

  const exportFile = async () => {
    const doc = new Document({ sections: [{ children: children }] });
    const base64 = await Packer.toBase64String(doc);
    const mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    Alert.alert("Export as DOCX", "Would you like to Save or Share the file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: async () => {
          if (Platform.OS === "android") {
            try {
              const permissions =
                await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

              if (permissions.granted && permissions.directoryUri) {
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  filename,
                  mimeType,
                )
                  .then(async (uri) => {
                    await FileSystem.writeAsStringAsync(uri, base64, {
                      encoding: FileSystem.EncodingType.Base64,
                    });
                  })
                  .catch((error) => console.error(error));

                Toast.show({
                  type: "success",
                  text1: "File Saved",
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
              text1: "Saving Not Supported",
            });
          }
        },
      },
      {
        text: "Share",
        onPress: async () => {
          if (await Sharing.isAvailableAsync()) {
            const uri = FileSystem.documentDirectory + filename;

            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(uri, {
              mimeType: mimeType,
              dialogTitle: "Share Word Report",
            });
          }
        },
      },
    ]);
  };

  generateDOCX();
  await exportFile();
};

export default exportDOCX;
