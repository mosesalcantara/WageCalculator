import CustomViolationForm from "@/components/CustomViolations/Form";
import AddPeriodModal from "@/components/Modals/AddPeriodModal";
import NavBar from "@/components/NavBar";
import Form from "@/components/Violations/Form";
import { customViolations, violations } from "@/db/schema";
import useCustomViolationHandlers from "@/hooks/useCustomViolationHandlers";
import useFetchCustomViolations from "@/hooks/useFetchCustomViolations";
import useFetchViolations from "@/hooks/useFetchViolations";
import useViolationHandlers from "@/hooks/useViolationHandlers";
import {
  CustomViolationType,
  ViolationKeys,
  ViolationTypes,
} from "@/types/globals";
import {
  customPeriodFormat,
  formatNumber,
  getDb,
  getPeriods,
  getTotal,
  periodFormat,
  toastVisibilityTime,
} from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { eq } from "drizzle-orm";
import { Href, useRouter } from "expo-router";
import { useCallback } from "react";
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
import { useImmer } from "use-immer";

const ViolationsPage = () => {
  const db = getDb();
  const router = useRouter();
  const employee_id = SessionStorage.getItem("employee_id") as string;

  const [type, setType] = useImmer<ViolationKeys>("Basic Wage");

  const { establishment, employee, violationTypes, setViolationTypes } =
    useFetchViolations(db);
  const { customViolationType, setCustomViolationType } =
    useFetchCustomViolations(db);

  const {
    handleChange,
    handleReceivedChange,
    handleAddPeriod,
    handleClearPeriod,
    handleRemovePeriod,
  } = useViolationHandlers(type, employee, setViolationTypes);
  const customViolationHandlers = useCustomViolationHandlers(
    establishment,
    customViolationType,
    setCustomViolationType,
  );

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

  const handleAddPeriodSubmit = async (
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

  const addPeriods = (dates: { start_date: string; end_date: string }[]) => {
    if (type == "Custom") {
      setCustomViolationType((prev) => {
        const periodsFormat = dates.map((date) => {
          return {
            ...customPeriodFormat,
            start_date: date.start_date,
            end_date: date.end_date,
            rate: employee ? `${employee.rate}` : "",
          };
        });

        return {
          periods: [...prev.periods, ...periodsFormat],
          received: prev.received,
        };
      });
    } else {
      setViolationTypes((prev) => {
        const periodsFormat = dates.map((date) => {
          return {
            ...periodFormat,
            start_date: date.start_date,
            end_date: date.end_date,
            rate: employee ? `${employee.rate}` : "",
          };
        });

        return {
          ...prev,
          [type]: {
            periods: [...prev[type].periods, ...periodsFormat],
          },
        };
      });
    }
  };

  const saveViolations = async (
    violationTypes: ViolationTypes,
    customViolationType: CustomViolationType,
  ) => {
    try {
      await db
        .delete(violations)
        .where(eq(violations.employee_id, Number(employee_id)));
      await db
        .delete(customViolations)
        .where(eq(customViolations.employee_id, Number(employee_id)));

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

  useFocusEffect(
    useCallback(() => {
      const appStateHandler = AppState.addEventListener(
        "change",
        (nextAppState) => {
          nextAppState == "background" &&
            saveViolations(violationTypes, customViolationType);
        },
      );

      const handleBackPress = () => {
        router.push("/employees" as Href);
        saveViolations(violationTypes, customViolationType);
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
    }, [violationTypes, customViolationType]),
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
                  {`${employee.last_name}, ${employee.first_name}${["na", "n/a"].includes(employee.middle_initial.toLowerCase()) ? "" : ` ${employee.middle_initial.toUpperCase()}.`}`}
                </Text>
                <Text className="ml-1.5 text-xl font-bold underline">
                  Subtotal:{" "}
                  {formatNumber(
                    type == "Custom"
                      ? customViolationHandlers.getTotal()
                      : getTotal(type, establishment.size, violationType),
                  )}
                </Text>
              </View>
              <AddPeriodModal onSubmit={handleAddPeriodSubmit} />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="h-[73%] px-4"
            >
              <ScrollView>
                <View className="gap-7">
                  {type == "Custom" ? (
                    <>
                      {customViolationType.periods.map((_, index) => (
                        <CustomViolationForm
                          key={index}
                          establishment={establishment}
                          employee={employee}
                          index={index}
                          customViolationType={customViolationType}
                          calculate={customViolationHandlers.calculate}
                          onChange={customViolationHandlers.handleChange}
                          onAddPeriod={customViolationHandlers.handleAddPeriod}
                          onRemovePeriod={
                            customViolationHandlers.handleRemovePeriod
                          }
                          onClearPeriod={
                            customViolationHandlers.handleClearPeriod
                          }
                        />
                      ))}

                      <View className="mx-10 mt-4 rounded-[0.625rem] bg-white p-2.5">
                        <Text className="text-base font-bold text-[#333]">
                          Received
                        </Text>
                        <TextInput
                          className="rounded-md border border-black px-2.5"
                          keyboardType="numeric"
                          placeholder="Enter pay received"
                          value={customViolationType.received}
                          onChangeText={(value) =>
                            customViolationHandlers.handleReceivedChange(value)
                          }
                        />
                      </View>
                    </>
                  ) : (
                    <>
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

                      <View className="mx-10 mt-4 rounded-[0.625rem] bg-white p-2.5">
                        <Text className="text-base font-bold text-[#333]">
                          Received
                        </Text>
                        <TextInput
                          className="rounded-md border border-black px-2.5"
                          keyboardType="numeric"
                          placeholder="Enter pay received"
                          value={violationType.received}
                          onChangeText={(value) => handleReceivedChange(value)}
                        />
                      </View>
                    </>
                  )}
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default ViolationsPage;
