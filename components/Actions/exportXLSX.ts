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
  getMinimumRate,
  getValueKeyword,
  getViolationKeyword,
  isHours,
  numberToLetter,
  parseNumber,
  toastVisibilityTime,
  validate,
  validatePeriods,
  validateViolationValues,
} from "@/utils/globals";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";
import * as XLSX from "xlsx-js-style";

const exportXLSX = async (
  wageOrders: WageOrder[],
  establishment: Establishment,
) => {
  const filename = `${establishment.name}.xlsx`;
  const rows = [
    [
      "Name",
      "Rate",
      "Violation",
      "Period",
      "Formula",
      "Total",
      "Subtotal",
      "Grand Total",
    ],
  ];

  const renderEmployee = (employee: Employee) => {
    if (employee.violations && employee.violations.length > 0) {
      const violationValues: ViolationValues = JSON.parse(
        employee.violations[0].values as string,
      );

      if (validateViolationValues(violationValues)) renderViolations(employee);
    }
  };

  const renderViolations = (employee: Employee) => {
    if (employee.violations && employee.violations.length > 0) {
      const violationValues: ViolationValues = JSON.parse(
        employee.violations[0].values as string,
      );

      Object.keys(violationValues).forEach((violationKey) => {
        const violationType = violationKey as ViolationType;
        Object.keys(violationValues[violationType]).forEach((paymentKey) => {
          const paymentType = paymentKey as PaymentType;
          const periods = violationValues[violationType][
            paymentType
          ] as Period[];

          if (validatePeriods(violationType, periods))
            renderType(employee, violationType, paymentType, periods);
        });
      });
    }
  };

  const renderType = (
    employee: Employee,
    violationType: ViolationType,
    paymentType: PaymentType,
    periods: Period[],
  ) => {
    const nameText = `${employee.last_name.toUpperCase()}, ${employee.first_name.toUpperCase()}${
      ["na", "n/a"].includes(employee.middle_initial.toLowerCase())
        ? ""
        : ` ${employee.middle_initial.toUpperCase()}.`
    }`;

    const typeText = `${paymentType} of ${getViolationKeyword(violationType)}`;

    periods.forEach((period, index) => {
      if (
        validate(
          period,
          isHours(violationType) ? ["received"] : ["received", "hours"],
        )
      ) {
        const value = isHours(violationType)
          ? `${parseNumber(period.days) * parseNumber(period.hours)}`
          : `${period.days}`;

        const rateText = `Php${formatNumber(period.rate)}/day`;

        const periodText = `Period${periods.length > 1 ? ` ${numberToLetter(index)}` : ""}: ${formatDate(
          period.start_date,
          "dd MMMM yyyy",
        )} to ${formatDate(period.end_date, "dd MMMM yyyy")} (${value} ${getValueKeyword(violationType, period.days, period.hours)})`;

        const { formulaText, totalText, subTotalText, grandTotalText } =
          renderFormula(violationType, paymentType, period);

        rows.push([
          nameText,
          rateText,
          typeText,
          periodText,
          formulaText,
          totalText,
          subTotalText,
          grandTotalText,
        ]);
      }
    });
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

    const formattedRateToUse = formatNumber(Math.max(rate, minimumRate));
    const total = formatNumber(
      calculate(
        wageOrders,
        establishment.size,
        violationType,
        paymentType,
        period,
      ) - parseNumber(period.received),
    );

    const subTotal = formatNumber(
      rows.slice(1, -1).reduce((acc, row) => acc + parseNumber(row[5]), 0),
    );

    const grandTotal = formatNumber(
      rows.slice(1).reduce((acc, row) => acc + parseNumber(row[6]), 0),
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
      text += ` - Php${formatNumber(period.received)}`;
    }

    const formulaText = `${text}`;
    const totalText = `Php${total}`;
    const subTotalText = `Php${subTotal}`;
    const grandTotalText = `Php${grandTotal}`;
    return { formulaText, totalText, subTotalText, grandTotalText };
  };

  const getMerges = (index: number, rows: string[][]) => {
    const getValues = (rows: string[][]) => rows.map((row) => row[index]);

    const values = getValues(rows);

    const getRepeating = (values: string[]) => {
      const counts: { [key: string]: number } = {};

      values.forEach(
        (key) => (counts[key] = counts[key] ? counts[key] + 1 : 1),
      );

      const repeating: string[] = [];
      Object.keys(counts).forEach((key) => {
        if (counts[key] > 1) repeating.push(key);
      });

      return repeating;
    };

    const repeating = getRepeating(values);

    const getStartAndEnd = (values: string[], value: string) => {
      const startToEnd: number[] = [];
      let index = values.indexOf(value);

      while (index !== -1) {
        startToEnd.push(index);
        index = values.indexOf(value, index + 1);
      }

      startToEnd.sort((a, b) => a - b);
      return [startToEnd[0], startToEnd[startToEnd.length - 1]];
    };

    const getIndices = (repeating: string[]) => {
      const indices: number[][] = [];

      repeating.forEach((value) => {
        const [start, end] = getStartAndEnd(values, value);
        start !== end && indices.push([start, end]);
      });

      return indices;
    };

    const indices = getIndices(repeating);

    const getRanges = (indices: number[][]) => {
      const ranges: {
        s: { c: number; r: number };
        e: { c: number; r: number };
      }[] = [];

      indices.forEach((startAndEndIndex) => {
        const [start, end] = startAndEndIndex;
        ranges.push({ s: { c: index, r: start }, e: { c: index, r: end } });
      });

      return ranges;
    };

    const merges = getRanges(indices);
    return merges;
  };

  const generateXLSX = () => {
    if (establishment.employees) {
      establishment.employees.forEach((employee) => {
        renderEmployee(employee);
      });
    }
  };

  const getBase64 = () => {
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
      { wch: 18 },
      { wch: 18 },
    ];
    worksheet["!merges"] = getMerges(0, rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, establishment.name);

    const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
    return base64;
  };

  const exportFile = () => {
    const base64 = getBase64();
    const mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    Alert.alert("Export as XLSX", "Would you like to Save or Share the file?", [
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
              dialogTitle: "Share Excel Report",
            });
          }
        },
      },
    ]);
  };

  generateXLSX();
  exportFile();
};

export default exportXLSX;
