import { Employee, Establishment, Period } from "@/types/globals";
import {
  calculate,
  formatDate,
  formatNumber,
  getDaysOrHours,
  getMinimumRate,
  getViolationKeyword,
  validate,
} from "@/utils/globals";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";
import * as XLSX from "xlsx";

const exportXLSX = async (record: Establishment | undefined): Promise<void> => {
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
        if (
          !violationType ||
          !violationType.periods ||
          violationType.periods.length === 0
        )
          return;

        // filter valid periods
        const validPeriods = (violationType.periods || []).filter((p: Period) =>
          validate(p),
        );
        if (validPeriods.length === 0) return;

        let violationSubtotal = 0;

        // For each valid period create one row
        validPeriods.forEach((period: Period) => {
          // ensure numeric values
          const empRateNum = Number(emp.rate ?? 0);
          const daysOrHoursNum = Number(period.daysOrHours ?? 1);
          const daysOrHoursStr = String(period.daysOrHours ?? "1");
          const rateToUse = Number(
            getMinimumRate(period.start_date, period.end_date, record.size),
          );
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
          const minRateObj = minimumRates.find(
            (m) => m.minimum_rate === rateToUse,
          );
          const prevailingLabel = minRateObj ? ` ( ${minRateObj.name} )` : "";

          // Period text (include days/hours label and the period dates)
          const periodText = `${formatDate(period.start_date)} to ${formatDate(period.end_date)} (${keyword})`;

          // Push a row for this period:
          wsData.push([
            index + 1,
            `${emp.last_name.toUpperCase()}, ${emp.first_name.toUpperCase()}${
              emp.middle_name
                ? " " + emp.middle_name.charAt(0).toUpperCase() + "."
                : ""
            }`,
            `₱${formatNumber(empRateNum)}/day`,
            `${type === "Holiday Pay" ? "Non-payment" : "Underpayment"} of ${getViolationKeyword(type)}`,
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
          wsData.push([
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            `₱${formatNumber(violationSubtotal)}`,
            "",
          ]);
          employeeTotal += violationSubtotal;
          employeeHasData = true;
        }
      });

      if (employeeHasData) {
        wsData.push([
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          `₱${formatNumber(employeeTotal)}`,
        ]);
      }
    });

    if (wsData.length === 1) {
      Toast.show({
        type: "info",
        text1: "No valid violations to export.",
        visibilityTime: 2000,
      });
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
              const permissions =
                await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

              if (permissions.granted && permissions.directoryUri) {
                const base64File = await FileSystem.readAsStringAsync(
                  filename,
                  {
                    encoding: FileSystem.EncodingType.Base64,
                  },
                );

                const newFileUri =
                  await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    "DOLECalcReport.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
              Toast.show({
                type: "error",
                text1: "Save failed.",
                visibilityTime: 2000,
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
      {
        text: "Share",
        onPress: async () => {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filename, {
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

export default exportXLSX;
