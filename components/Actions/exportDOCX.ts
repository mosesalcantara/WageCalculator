import { Employee, Establishment, Period } from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getDaysOrHours,
  getMinimumRate,
  getViolationKeyword,
  numberToLetter,
  validate,
  wageOrders,
} from "@/utils/globals";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";

const exportDOCX = async (record: Establishment) => {
  const buildFormula = (
    type: string,
    rateToUse: number,
    empRate: number,
    period: Period,
    totalNumeric: number,
  ): { expr: string; totalStr: string } => {
    const num = Number(period.daysOrHours) || 0;
    const keyword = getDaysOrHours(type, period.daysOrHours);
    let expr = "";
    switch (type) {
      case "Basic Wage":
        expr = `(Php${formatNumber(rateToUse)} - Php${formatNumber(empRate)}) x ${keyword}`;
        break;
      case "Overtime Pay":
        expr = `Php${formatNumber(rateToUse)} / 8 x ${period.type == "Normal Day" ? "25" : "30"}% x ${keyword}`;
        break;
      case "Night Shift Differential":
        expr = `Php${formatNumber(rateToUse)} / 8 x 10% x ${keyword}`;
        break;
      case "Special Day":
        expr = `Php${formatNumber(rateToUse)} x 30% x ${keyword}`;
        break;
      case "Rest Day":
        expr = `Php${formatNumber(rateToUse)} x 30% x ${keyword}`;
        break;
      case "Holiday Pay":
        expr = `Php${formatNumber(rateToUse)} x ${keyword}`;
        break;
      case "13th Month Pay":
        expr = `Php${formatNumber(rateToUse)} x ${keyword} / 12 months`;
        break;
      default:
        expr = `${keyword} x Php${formatNumber(rateToUse)}`;
    }

    return { expr, totalStr: formatNumber(totalNumeric) };
  };

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
            text: `${index + 1}. ${emp.last_name?.toUpperCase()}, ${emp.first_name?.toUpperCase()}${
              emp.middle_name
                ? ` ${emp.middle_name.charAt(0).toUpperCase()}.`
                : ""
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
        if (
          !violationType ||
          !violationType.periods ||
          violationType.periods.length === 0
        ) {
          return;
        }
        const validPeriods = violationType.periods.filter((p: any) =>
          validate(p),
        );
        if (validPeriods.length === 0) {
          return;
        }

        let subtotal = 0;

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${type === "Holiday Pay" ? "Non-payment" : "Underpayment"} of ${getViolationKeyword(type)}`,
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
          const minName = wageOrder ? wageOrder.name : "";

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

          if (minimumRate >= emp.rate) {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Prevailing Rate: Php${formatNumber(minimumRate)}${minName ? ` (${minName})` : ""}`,
                    italics: true,
                    size: 20,
                  }),
                ],
              }),
            );
          }

          const { expr, totalStr } = buildFormula(
            type,
            minimumRate,
            emp.rate,
            period,
            result,
          );

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

  Alert.alert("Export DOCX", "Would you like to Save or Share the file?", [
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
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            dialogTitle: "Share Report",
          });
        }
      },
    },
    { text: "Cancel", style: "cancel" },
  ]);
};

export default exportDOCX;
