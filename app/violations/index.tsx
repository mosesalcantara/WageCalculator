import CustomForm from "@/components/Custom/Form";
import AddPeriodModal from "@/components/Modals/AddPeriodModal";
import NavBar from "@/components/NavBar";
import Form from "@/components/Violations/Form";
import { customViolations, violations } from "@/db/schema";
import useFetchCustomViolations from "@/hooks/useFetchCustomViolations";
import useFetchViolations from "@/hooks/useFetchViolations";
import {
  CustomPeriod,
  CustomViolationType,
  ViolationKeys,
  ViolationTypes,
} from "@/types/globals";
import {
  formatNumber,
  getDb,
  getPeriodFormat,
  getTotal,
  periodFormat,
  toastVisibilityTime,
  wageOrders,
} from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { differenceInDays, subDays } from "date-fns";
import { eq } from "drizzle-orm";
import { Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

const ViolationsPage = () => {
  const db = getDb();
  const router = useRouter();
  const employee_id = SessionStorage.getItem("employee_id") as string;

  const [type, setType] = useState<ViolationKeys>("Basic Wage");
  const { establishment, employee, violationTypes, setViolationTypes } =
    useFetchViolations(db);
  const { customViolationType, setCustomViolationType } =
    useFetchCustomViolations(db);

  const violationType = violationTypes[type];

  const getTabs = (size: string) => {
    const tabs = [
      { name: "Basic Wage", icon: "payments" },
      { name: "Overtime Pay", icon: "access-time" },
      { name: "Night Shift Differential", icon: "nights-stay" },
      { name: "Special Day", icon: "star" },
      { name: "Rest Day", icon: "coffee" },
      { name: "Holiday Pay", icon: "event-available" },
      { name: "13th Month Pay", icon: "card-giftcard" },
      { name: "Custom", icon: "build" },
    ];

    let excluded: string[] = [];
    if (size == "Employing 1 to 5 workers") {
      excluded = ["Holiday Pay", "Night Shift Differential"];
    } else if (size == "Employing 1 to 9 workers") {
      excluded = ["Holiday Pay"];
    }

    const filteredTabs = tabs.filter((tab) => {
      return !excluded.includes(tab.name);
    });

    return filteredTabs;
  };

  const handleReceivedChange = (value: string) => {
    setViolationTypes((prev) => {
      return {
        ...prev,
        [type]: { periods: prev[type].periods, received: value },
      };
    });
  };

  const addRecord = async (
    violationTypes: ViolationTypes,
    customViolationType: CustomViolationType,
  ) => {
    try {
      await db
        .delete(violations)
        .where(eq(violations.employee_id, Number(employee_id)));
      await db.insert(violations).values({
        values: JSON.stringify(violationTypes),
        employee_id: Number(employee_id),
      });
      await db.insert(customViolations).values({
        values: JSON.stringify(customViolationType),
        employee_id: Number(employee_id),
      });
      Toast.show({
        type: "success",
        text1: "Changes Saved",
        visibilityTime: toastVisibilityTime,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  };

  const handleSubmit = async (
    values: { start_date: string; end_date: string },
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      const { start_date, end_date } = values;
      const periods = getPeriods(start_date, end_date);
      addPeriods(periods);
      resetForm();
      Toast.show({
        type: "success",
        text1: "Added Period",
        visibilityTime: toastVisibilityTime,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  };

  const getPeriods = (start_date: string, end_date: string) => {
    const periods = [];

    wageOrders.sort((a, b) => {
      return Number(new Date(a.date)) - Number(new Date(b.date));
    });

    const wageOrderDates = wageOrders.map((wageOrder) => wageOrder.date);
    const isPast =
      differenceInDays(start_date, wageOrders[0].date) <= 0 &&
      differenceInDays(end_date, wageOrders[0].date) <= 0;
    const isFuture =
      differenceInDays(start_date, wageOrders[wageOrders.length - 1].date) >=
        0 &&
      differenceInDays(end_date, wageOrders[wageOrderDates.length - 1].date) >=
        0;

    if (isPast || isFuture) {
      periods.push({
        start_date: start_date,
        end_date: end_date,
      });
    } else {
      const start = wageOrders.findLast(
        (wageOrder) => differenceInDays(start_date, wageOrder.date) >= 0,
      );

      const end = wageOrders.findLast(
        (wageOrder) => differenceInDays(end_date, wageOrder.date) >= 0,
      );

      const filteredWageOrders = [];
      for (const wageOrder of wageOrders) {
        if (
          differenceInDays(start ? start.date : start_date, wageOrder.date) <=
            0 &&
          differenceInDays(end ? end.date : end_date, wageOrder.date) >= 0
        ) {
          filteredWageOrders.push(wageOrder);
        }
      }

      let index = 0;
      for (const wageOrder of filteredWageOrders) {
        periods.push({
          start_date: index == 0 ? start_date : wageOrder.date,
          end_date:
            index == filteredWageOrders.length - 1
              ? end_date
              : subDays(filteredWageOrders[index + 1].date, 1)
                  .toISOString()
                  .split("T")[0],
        });

        ++index;
      }
    }

    return periods;
  };

  const addPeriods = (dates: { start_date: string; end_date: string }[]) => {
    setViolationTypes((prev) => {
      const periodsFormat = dates.map((date) => {
        return {
          ...periodFormat,
          start_date: date.start_date,
          end_date: date.end_date,
          rate: `${employee ? employee.rate : ""}`,
        };
      });

      return {
        ...prev,
        [type]: {
          periods: [...prev[type].periods, ...periodsFormat],
        },
      };
    });
  };

  const customCalculate = (period: CustomPeriod) => {
    const values = {
      ...period,
      rate: period.rate ? Number(period.rate) : 0,
      days: period.days ? Number(period.days) : 0,
      nightShiftHours: period.nightShiftHours
        ? Number(period.nightShiftHours)
        : 0,
      overtimeHours: period.overtimeHours ? Number(period.overtimeHours) : 0,
    };

    const type = period.type.toLowerCase();
    let nightShiftMultiplier = 0;
    if (type.includes("night shift")) {
      nightShiftMultiplier = 1.1;
    }

    let overtimeMultiplier = 0;
    if (type.includes("ot")) {
      overtimeMultiplier = 1.3;
      if (type.includes("ordinary day")) {
        overtimeMultiplier = 1.25;
      }
    }

    let daysMultiplier = 0;
    if (type.includes("ordinary day")) {
      daysMultiplier = 1;
    } else if (
      type.includes("rest day") &&
      type.includes("special (non-working) day")
    ) {
      daysMultiplier = 1.5;
      if (type.includes("double")) {
        daysMultiplier = 1.95;
      }
    } else if (type.includes("holiday")) {
      daysMultiplier = 2;
      if (type.includes("double")) {
        daysMultiplier = 3;
        if (type.includes("rest day")) {
          daysMultiplier = 3.9;
        }
      } else {
        if (type.includes("rest day")) {
          daysMultiplier = 2.6;
        }
      }
    } else if (
      type.includes("rest day") ||
      type.includes("special (non-working) day")
    ) {
      daysMultiplier = 1.3;
      if (type.includes("double")) {
        daysMultiplier = 1.5;
      }
    }

    const { rate, days, nightShiftHours, overtimeHours } = values;

    let total = 0;
    total =
      rate * daysMultiplier * days +
      (rate / 8) * nightShiftMultiplier * nightShiftHours +
      (rate / 8) * overtimeMultiplier * overtimeHours;

    return {
      rate,
      daysMultiplier,
      days,
      nightShiftMultiplier,
      nightShiftHours,
      overtimeMultiplier,
      overtimeHours,
      total,
    };
  };

  const getCustomTotal = () => {
    let result = 0;
    customViolationType.periods.forEach((period) => {
      result += customCalculate(period).total;
    });
    return result;
  };

  const handleChange = (
    index: number,
    key: string,
    value: string | number | Date,
  ) => {
    if (key.endsWith("_date")) {
      value = (value as Date).toISOString().split("T")[0];
    }

    setViolationTypes((prev) => {
      const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
        index == periodIndex ? { ...period, [key]: `${value}` } : period,
      );

      return { ...prev, [type]: { ...prev[type], periods: updatedPeriods } };
    });
  };

  const handleAddPeriod = () => {
    setViolationTypes((prev) => {
      return {
        ...prev,
        [type]: {
          periods: [...prev[type].periods, getPeriodFormat(employee?.rate)],
        },
      };
    });
  };

  const handleRemovePeriod = (index: number) => {
    setViolationTypes((prev) => {
      const updatedPeriods = prev[type].periods;
      updatedPeriods.splice(index, 1);
      return { ...prev, [type]: { periods: updatedPeriods } };
    });
  };

  const handleClearPeriod = (index: number) => {
    setViolationTypes((prev) => {
      const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
        index == periodIndex ? getPeriodFormat() : period,
      );
      return { ...prev, [type]: { periods: updatedPeriods } };
    });
  };

  useFocusEffect(
    useCallback(() => {
      const appStateHandler = AppState.addEventListener(
        "change",
        (nextAppState) => {
          nextAppState == "background" &&
            addRecord(violationTypes, customViolationType);
        },
      );

      const handleBackPress = () => {
        router.push("/employees" as Href);
        addRecord(violationTypes, customViolationType);
        return true;
      };

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => {
        backhandler.remove();
        appStateHandler.remove();
      };
    }, [violationTypes]),
  );

  return (
    <>
      {establishment && employee && violationTypes && (
        <>
          <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
            <NavBar />

            <View className="bg-[#acb6e2ff]">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="border-b border-b-[#333] py-2.5 "
              >
                {getTabs(establishment.size).map((tab) => (
                  <TouchableOpacity
                    key={tab.name}
                    className={`mx-[0.3125rem] h-11 flex-row items-center rounded-lg border px-3 ${type === tab.name ? `border-[#2c3e50] bg-[#2c3e50]` : `border-[#ccc] bg-white`}`}
                    onPress={() => setType(tab.name as ViolationKeys)}
                  >
                    <Icon
                      name={tab.icon}
                      size={18}
                      color={type === tab.name ? "#fff" : "#555"}
                    />
                    <Text
                      className={`ml-1.5 text-sm ${type === tab.name ? `text-white` : `text-[#555]`}`}
                    >
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row items-center justify-between px-4 py-2.5">
              <View>
                <Text className="ml-1.5 text-xl font-bold">
                  {`${employee.last_name}, ${employee.first_name}${["NA", "N/A"].includes(employee.middle_initial.toUpperCase()) ? "" : ` ${employee.middle_initial.toUpperCase()}.`}`}
                </Text>
                <Text className="ml-1.5 text-xl font-bold underline">
                  Subtotal:{" "}
                  {formatNumber(
                    type == "Custom"
                      ? getCustomTotal()
                      : getTotal(type, establishment.size, violationType),
                  )}
                </Text>
              </View>
              <AddPeriodModal onSubmit={handleSubmit} />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="h-[75%] px-4"
            >
              <ScrollView>
                {type == "Custom" ? (
                  <>
                    <View className="gap-7">
                      {customViolationType.periods.map((_, index) => (
                        <CustomForm
                          key={index}
                          index={index}
                          customViolationTypeState={[
                            customViolationType,
                            setCustomViolationType,
                          ]}
                          calculate={customCalculate}
                        />
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <View className="gap-7">
                      {violationType.periods.map((_, index) => (
                        <Form
                          key={index}
                          type={type}
                          index={index}
                          establishment={establishment}
                          employee={employee}
                          violationTypes={violationTypes}
                          onChange={handleChange}
                          onAddPeriod={handleAddPeriod}
                          onRemovePeriod={handleRemovePeriod}
                          onClearPeriod={handleClearPeriod}
                        />
                      ))}
                    </View>

                    <View className="mx-10 mt-4 rounded-[0.625rem] bg-white p-2.5">
                      <Text className="text-base font-bold text-[#333]">
                        Received
                      </Text>
                      <TextInput
                        className="h-11 rounded-md border border-black px-2.5"
                        keyboardType="numeric"
                        placeholder="Enter pay received"
                        value={violationType.received}
                        onChangeText={(value) => handleReceivedChange(value)}
                      />
                    </View>
                  </>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default ViolationsPage;
