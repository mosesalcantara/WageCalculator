import Form from "@/components/Calculator/Form";
import AddPeriodModal from "@/components/Modals/AddPeriodModal";
import NavBar from "@/components/NavBar";
import { violations } from "@/db/schema";
import useFetchViolations from "@/hooks/useFetchViolations";
import { ViolationTypes, ViolationValues } from "@/types/globals";
import {
  formatNumber,
  getDb,
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
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

const CalculatorPage = () => {
  const db = getDb();
  const router = useRouter();
  const parent_id = SessionStorage.getItem("employee_id") as string;

  const [type, setType] = useState<ViolationTypes>("Basic Wage");
  const { grandparent, parent, values, setValues } = useFetchViolations(db);

  const violationType = values[type];

  const getTabs = (size: string) => {
    const tabs = [
      { name: "Basic Wage", icon: "payments" },
      { name: "Overtime Pay", icon: "access-time" },
      { name: "Night Shift Differential", icon: "nights-stay" },
      { name: "Special Day", icon: "star" },
      { name: "Rest Day", icon: "coffee" },
      { name: "Holiday Pay", icon: "event-available" },
      { name: "13th Month Pay", icon: "card-giftcard" },
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
    setValues((prev) => {
      return {
        ...prev,
        [type]: { periods: prev[type].periods, received: value },
      };
    });
  };

  const addRecord = async (values: ViolationValues) => {
    try {
      await db
        .delete(violations)
        .where(eq(violations.employee_id, Number(parent_id)));
      await db.insert(violations).values({
        values: JSON.stringify(values),
        employee_id: Number(parent_id),
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
        text1: "Added Periods",
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
      differenceInDays(start_date, wageOrderDates[0]) <= 0 &&
      differenceInDays(end_date, wageOrderDates[0]) <= 0;
    const isFuture =
      differenceInDays(start_date, wageOrderDates[wageOrderDates.length - 1]) >=
        0 &&
      differenceInDays(end_date, wageOrderDates[wageOrderDates.length - 1]) >=
        0;

    if (isPast || isFuture) {
      periods.push({
        start_date: start_date,
        end_date: end_date,
      });
    } else {
      const start = wageOrderDates.findLast(
        (wageOrderDate) => differenceInDays(start_date, wageOrderDate) >= 0,
      ) || start_date;

      const end = wageOrderDates.findLast(
        (wageOrderDate) => differenceInDays(end_date, wageOrderDate) >= 0,
      );

      const filteredWageOrders = [];
      for (const wageOrderDate of wageOrderDates) {
        if (
          differenceInDays(start!, wageOrderDate) <= 0 &&
          differenceInDays(end!, wageOrderDate) >= 0
        ) {
          filteredWageOrders.push(wageOrderDate);
        }
      }

      let index = 0;
      for (const wageOrderDate of filteredWageOrders) {
        periods.push({
          start_date: index == 0 ? start_date : wageOrderDate,
          end_date:
            index == filteredWageOrders.length - 1
              ? end_date
              : subDays(filteredWageOrders[index + 1], 1)
                  .toISOString()
                  .split("T")[0],
        });

        ++index;
      }
    }

    return periods;
  };

  const addPeriods = (dates: { start_date: string; end_date: string }[]) => {
    setValues((prev) => {
      const periodsFormat = dates.map((date) => {
        return {
          ...periodFormat,
          start_date: date.start_date,
          end_date: date.end_date,
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

  useFocusEffect(
    useCallback(() => {
      const appStateHandler = AppState.addEventListener(
        "change",
        (nextAppState) => {
          nextAppState == "background" && addRecord(values);
        },
      );

      const handleBackPress = () => {
        router.push("/employees" as Href);
        addRecord(values);
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
    }, [values]),
  );

  return (
    <>
      {grandparent && parent && values && (
        <>
          <NavBar />

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="border-b border-b-[#ddd] bg-white py-2.5"
            >
              {getTabs(grandparent.size).map((tab) => (
                <TouchableOpacity
                  key={tab.name}
                  className={`mx-[0.3125rem] h-11 flex-row items-center rounded-lg border px-3 ${type === tab.name ? `border-[#2c3e50] bg-[#2c3e50]` : `border-[#ccc] bg-white`}`}
                  onPress={() => setType(tab.name as ViolationTypes)}
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

          <View className="flex-1 bg-[#f5f5f5] px-4">
            <View className="flex-row items-center justify-between">
              <View className="py-2.5">
                <Text className="ml-1.5 text-xl font-bold">
                  {`${parent.last_name}, ${parent.first_name} ${parent.middle_name.slice(0, 1).toUpperCase()}. - ${formatNumber(
                    parent.rate,
                  )}`}
                </Text>
                <Text className="ml-1.5 text-xl font-bold underline">
                  Subtotal:{" "}
                  {formatNumber(
                    getTotal(violationType, type, grandparent.size),
                  )}
                </Text>
              </View>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="h-[37rem]"
            >
              <ScrollView>
                <View className="gap-7">
                  {violationType.periods.map((_, index) => (
                    <Form
                      key={index}
                      grandparent={grandparent}
                      parent={parent}
                      type={type}
                      index={index}
                      valuesState={[values, setValues]}
                    />
                  ))}
                </View>

                {type == "13th Month Pay" && (
                  <View className="mx-10 pt-4">
                    <Text className="mb-1 mt-2.5 text-base font-bold text-[#333]">
                      Received
                    </Text>
                    <TextInput
                      className="h-11 rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                      keyboardType="numeric"
                      placeholder="Enter pay received"
                      value={violationType.received}
                      onChangeText={(value) => handleReceivedChange(value)}
                    />
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>

            <AddPeriodModal onSubmit={handleSubmit} />
          </View>
        </>
      )}
    </>
  );
};

export default CalculatorPage;
