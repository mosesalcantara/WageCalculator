import {
  Employee,
  Establishment,
  PaymentType,
  Period,
  ViolationType,
  ViolationValues,
  WageOrder,
} from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getGrandTotal,
  getMinimumRate,
  getSubtotal,
  getValueKeyword,
  getViolationKeyword,
  isHours,
  numberToLetter,
  parseNumber,
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
      const violationValues: ViolationValues = JSON.parse(
        employee.violations[0].values as string,
      );

      let valid = 0;
      Object.keys(violationValues).forEach((violationKey) => {
        const violationType = violationKey as ViolationType;
        Object.keys(violationValues[violationType]).forEach((paymentKey) => {
          const paymentType = paymentKey as PaymentType;

          violationValues[violationType][paymentType].forEach((period) => {
            if (
              validate(
                period,
                isHours(violationType) ? ["received"] : ["received", "hours"],
              )
            ) {
              ++valid;
            }
          });
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
                break: index === 0 ? 2 : 1,
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
      const violationValues: ViolationValues = JSON.parse(
        employee.violations[0].values as string,
      );

      let total = 0;
      Object.keys(violationValues).forEach((violationKey) => {
        const violationType = violationKey as ViolationType;
        Object.keys(violationValues[violationType]).forEach((paymentKey) => {
          const paymentType = paymentKey as PaymentType;

          total += getSubtotal(
            wageOrders,
            establishment.size,
            violationType,
            paymentType,
            violationValues[violationType][paymentType] as Period[],
          );

          let valid = 0;
          violationValues[violationType][paymentType].forEach((period) => {
            if (
              validate(
                period,
                isHours(violationType) ? ["received"] : ["received", "hours"],
              )
            ) {
              ++valid;
            }
          });

          if (valid > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${
                      paymentType
                    } of ${getViolationKeyword(violationType)}`,
                    font: { name: "Arial" },
                    size: 28,
                    bold: true,
                    underline: {},
                    break: 1,
                  }),
                ],
              }),
            );

            renderType(
              violationType,
              paymentType,
              violationValues[violationType][paymentType] as Period[],
            );
          }
        });
      });

      children.push(
        new Paragraph({
          children: [
        new TextRun({
          text: `Total: `,
          font: { name: "Arial" },
          size: 28,
        }),
        new TextRun({
          text: `Php${formatNumber(total)}`,
          font: { name: "Arial" },
          size: 28,
          bold: true,
          underline: { type: "double" },
        }),
          ],
          alignment: "right",
        }),
      );
    }
  };

  const renderType = (
    violationType: ViolationType,
    paymentType: PaymentType,
    periods: Period[],
  ) => {
    let subtotal = 0;

    periods.forEach((period, index) => {
      const result = calculate(
        wageOrders,
        establishment.size,
        violationType,
        paymentType,
        period,
      );

      if (
        validate(
          period,
          isHours(violationType) ? ["received"] : ["received", "hours"],
        )
      ) {
        subtotal = subtotal + result - parseNumber(period.received);

        const value = isHours(violationType)
          ? `${parseNumber(period.days) * parseNumber(period.hours)}`
          : `${period.days}`;

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Period${periods.length > 1 ? ` ${numberToLetter(index)}` : ""}: ${formatDate(
                  period.start_date,
                  "dd MMMM yyyy",
                )} to ${formatDate(period.end_date, "dd MMMM yyyy")} (${value} ${getValueKeyword(violationType, period.days, period.hours)})`,
                font: { name: "Arial" },
                size: 28,
                break: index === 0 ? 0 : 1,
              }),
            ],
          }),
        );

        renderFormula(violationType, paymentType, period);

        if (parseNumber(period.received) > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Actual Pay Received: Php${formatNumber(period.received)}`,
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
                  text: `Php${formatNumber(result)} - ${formatNumber(period.received)} =`,
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
                  text: `Php${formatNumber(result - parseNumber(period.received))}`,
                  font: { name: "Arial" },
                  size: 28,
                }),
              ],
              alignment: "right",
            }),
          );
        }
      }
    });

    if (periods.length > 1) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Subtotal: Php${formatNumber(subtotal)}`,
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
    violationType: ViolationType,
    paymentType: PaymentType,
    period: Period,
  ) => {
    let text = "";

    const rate = parseNumber(period.rate);
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
      calculate(
        wageOrders,
        establishment.size,
        violationType,
        paymentType,
        period,
      ),
    );
    const keyword = getValueKeyword(violationType, period.days, period.hours);

    switch (violationType) {
      case "Basic Wage":
        if (paymentType === "Underpayment") {
          text = `Php${formatNumber(minimumRate)} - Php${formatNumber(period.rate)} x ${period.days} ${keyword}`;
        } else {
          text = `Php${formattedRateToUse} x ${period.days} ${keyword}`;
        }

        break;
      case "Overtime Pay":
        text = `Php${formattedRateToUse} / 8 x ${period.type === "Normal Day" ? "125" : "130"}% x ${period.days} day${parseNumber(period.days) === 1 ? "" : "s"} x ${period.hours} ${keyword}`;
        break;
      case "Night Shift Differential":
        text = `Php${formattedRateToUse} / 8 x 10% x ${period.days} day${parseNumber(period.days) === 1 ? "" : "s"} x ${period.hours} ${keyword}`;
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

    if (parseNumber(period.received) > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${text} = Php${total}`,
              font: { name: "Arial" },
              size: 28,
            }),
          ],
        }),
      );
    } else {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${text} =`,
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
              text: `Php${total}`,
              font: { name: "Arial" },
              size: 28,
            }),
          ],
          alignment: "right",
        }),
      );
    }
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
      }),
    );

    if (establishment.employees) {
      establishment.employees.forEach((employee, index) => {
        renderEmployee(index, employee);
      });

      children.push(
        new Paragraph({
          children: [
        new TextRun({
          text: `Grand Total: `,
          font: { name: "Arial" },
          size: 28,
          break: 1,
        }),
        new TextRun({
          text: `Php${formatNumber(getGrandTotal(wageOrders, establishment.size, establishment.employees))}`,
          font: { name: "Arial" },
          size: 28,
          bold: true,
          underline: { type: "double" },
        }),
          ],
          alignment: "right",
        }),
      );
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
