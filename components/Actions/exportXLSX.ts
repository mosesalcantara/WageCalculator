import {
  Employee,
  Establishment,
  Period,
  ViolationTypes,
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
} from "@/utils/globals";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";
import * as XLSX from "xlsx-js-style";

const exportXLSX = async (establishment: Establishment) => {
  const rows = [["Name", "Rate", "Violation", "Period", "Formula", "Total"]];

  const renderEmployee = (index: number, employee: Employee) => {
    if (employee.violations && employee.violations.length > 0) {
      const violations = JSON.parse(employee.violations[0].values as string);

      let valid = 0;
      Object.values(violations as ViolationTypes).forEach((violationType) => {
        violationType.periods.forEach((period) => {
          validate(period) && (valid += 1);
        });
      });

      if (valid > 0) {
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
        total += getTotal(type, establishment.size, violationType);

        let valid = 0;
        violationType.periods.forEach((period: Period) => {
          if (validate(period)) {
            valid += 1;
          }
        });

        if (valid > 0) {
          renderViolationType(employee, type, violations[type]);
        }
      });
    }
  };

  const renderViolationType = (
    employee: Employee,
    type: string,
    violationType: { periods: Period[]; received: string },
  ) => {
    const nameText = `${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}${
      ["na", "n/a"].includes(employee.middle_initial.toLowerCase())
        ? ""
        : ` ${employee.middle_initial.toUpperCase()}.`
    }`;
    const typeText = `${
      !violationType.received || Number(violationType.received) == 0
        ? "Non-payment"
        : "Underpayment"
    } of ${getViolationKeyword(type)}`;

    let subtotal = 0;

    violationType.periods.forEach((period, index) => {
      const result = calculate(type, establishment.size, period);
      if (validate(period)) {
        subtotal += result;
        const rateText = `Php${formatNumber(period.rate)}/day`;
        const periodText = `Period${violationType.periods.length > 1 ? ` ${numberToLetter(index)}` : ""}: ${formatDate(
          period.start_date,
        )} to ${formatDate(period.end_date)} (${getDaysOrHours(type, period.daysOrHours)})`;
        const { formulaText, totalText } = renderFormula(type, period);

        rows.push([
          nameText,
          rateText,
          typeText,
          periodText,
          formulaText,
          totalText,
        ]);
      }
    });
  };

  const renderFormula = (type: string, period: Period) => {
    let text = "";

    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(
      establishment.size,
      period.start_date,
      period.end_date,
    );

    const formattedRateToUse = formatNumber(Math.max(rate, minimumRate));
    const total = formatNumber(calculate(type, establishment.size, period));
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

    const formulaText = `${text}`;
    const totalText = `Php${total}`;
    return { formulaText, totalText };
  };

  const getMerges = (rows: string[][]) => {
    const getNames = (rows: string[][]) => rows.map((row) => row[0]);

    const names = getNames(rows);

    const getRepeatingNames = (names: string[]) => {
      const counts: { [key: string]: number } = {};

      names.forEach(
        (name) => (counts[name] = counts[name] ? counts[name] + 1 : 1),
      );

      const repeatingNames: string[] = [];
      Object.keys(counts).forEach((name) => {
        counts[name] > 1 && repeatingNames.push(name);
      });

      return repeatingNames;
    };

    const repeatingNames = getRepeatingNames(names);

    const getStartAndEnd = (names: string[], name: string) => {
      const startToEnd: number[] = [];
      let index = names.indexOf(name);
      while (index !== -1) {
        startToEnd.push(index);
        index = names.indexOf(name, index + 1);
      }
      startToEnd.sort((a, b) => a - b);
      return [startToEnd[0], startToEnd[startToEnd.length - 1]];
    };

    const getIndices = (repeatingNames: string[]) => {
      const indices: number[][] = [];
      repeatingNames.forEach((name) => {
        const [start, end] = getStartAndEnd(names, name);
        start != end && indices.push([start, end]);
      });
      return indices;
    };

    const indices = getIndices(repeatingNames);

    const getRanges = (indices: number[][]) => {
      const ranges: {
        s: { c: number; r: number };
        e: { c: number; r: number };
      }[] = [];
      indices.forEach((startAndEndIndex) => {
        const [start, end] = startAndEndIndex;
        ranges.push({ s: { c: 0, r: start }, e: { c: 0, r: end } });
      });
      return ranges;
    };

    const merges = getRanges(indices);
    return merges;
  };

  const generateFile = async () => {
    if (establishment.employees) {
      establishment.employees.forEach((employee, index) => {
        renderEmployee(index, employee);
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(rows);

      Object.values(worksheet).forEach((cell) => {
        if (typeof cell != "object") return;
        cell.s = { alignment: { vertical: "center" } };
      });

      worksheet["!cols"] = [
        { wch: 30 },
        { wch: 18 },
        { wch: 40 },
        { wch: 60 },
        { wch: 40 },
        { wch: 18 },
      ];

      worksheet["!merges"] = getMerges(rows);

      XLSX.utils.book_append_sheet(workbook, worksheet, establishment.name);

      const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
      const uri = FileSystem.documentDirectory + `${establishment.name}.xlsx`;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return uri;
    }
  };

  const exportFile = (uri: string) => {
    Alert.alert("Export Excel", "Would you like to Save or Share the file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Share",
        onPress: async () => {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              dialogTitle: "Share Excel Report",
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
                const base64 = await FileSystem.readAsStringAsync(uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                const newUri =
                  await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    `${establishment.name}.xlsx`,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  );

                await FileSystem.writeAsStringAsync(newUri, base64, {
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
              text1: "Saving Not Supported",
            });
          }
        },
      },
    ]);
  };

  const uri = await generateFile();
  uri && exportFile(uri);
};

export default exportXLSX;
