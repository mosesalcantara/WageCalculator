import CustomViolationForm from "@/components/Forms/CustomViolationsForm";
import Form from "@/components/Forms/ViolationsForm";
import Label from "@/components/Label";
import AddPeriodModal from "@/components/Modals/AddPeriodModal";
import NavBar from "@/components/NavBar";
import { customViolations, violations } from "@/db/schema";
import useCustomViolationHandlers from "@/hooks/useCustomViolationHandlers";
import useFetchCustomViolations from "@/hooks/useFetchCustomViolations";
import useFetchHolidays from "@/hooks/useFetchHolidays";
import useFetchViolations from "@/hooks/useFetchViolations";
import useFetchWageOrders from "@/hooks/useFetchWageOrders";
import useViolationHandlers from "@/hooks/useViolationHandlers";
import { period as schema, Period as Values } from "@/schemas/globals";
import {
  CustomPeriod,
  CustomViolationType,
  PaymentType,
  Period,
  ViolationType,
  ViolationValues,
} from "@/types/globals";
import {
  customPeriodFormat,
  formatDate,
  formatNumber,
  getDb,
  getPeriods,
  getTotal,
  periodFormat,
  toastVisibilityTime,
} from "@/utils/globals";
import { yupResolver } from "@hookform/resolvers/yup";
import { eq } from "drizzle-orm";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
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
import { useImmer } from "use-immer";

const ViolationsPage = () => {
  const db = getDb(useSQLiteContext());
  const router = useRouter();
  const form = useForm({ resolver: yupResolver(schema) });
  const employee_id = SessionStorage.getItem("employee_id") as string;

  const [violationType, setViolationType] =
    useImmer<ViolationType>("Basic Wage");
  const [paymentType, setPaymentType] = useImmer<PaymentType>("Underpayment");
  const [isAddPeriodModalVisible, setIsAddPeriodModalVisible] = useImmer(false);

  const { wageOrders } = useFetchWageOrders(db);
  const { holidays } = useFetchHolidays(db);

  const { establishment, employee, violationValues, setViolationValues } =
    useFetchViolations(db);
  const { customViolationType, setCustomViolationType } =
    useFetchCustomViolations(db);

  const violationPeriods: Period[] =
    violationValues[violationType][paymentType];

  const violationHandlers = useViolationHandlers(
    violationType,
    paymentType,
    employee,
    setViolationValues,
  );
  const customViolationHandlers = useCustomViolationHandlers(
    wageOrders || [],
    establishment,
    customViolationType,
    setCustomViolationType,
  );

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

  type IconNames =
    | "payments"
    | "access-time"
    | "nights-stay"
    | "star"
    | "coffee"
    | "event-available"
    | "card-giftcard"
    | "build";

  const getTabs = (size: string) => {
    let excluded: string[] = [];
    if (size === "Employing 1 to 5 workers") {
      excluded = ["Holiday Pay", "Night Shift Differential"];
    } else if (size === "Employing 1 to 9 workers") {
      excluded = ["Holiday Pay"];
    }

    const filteredTabs = tabs.filter((tab) => {
      return !excluded.includes(tab.name);
    });

    return filteredTabs;
  };

  const handleAddPeriodModalToggle = (isVisible: boolean) => {
    setIsAddPeriodModalVisible(isVisible);
  };

  const handleAddPeriodModalSubmit = async (values: Values) => {
    try {
      const periods = getPeriods(
        wageOrders || [],
        formatDate(values.start_date),
        formatDate(values.end_date),
      );

      addPeriods(periods);
      form.reset();
      handleAddPeriodModalToggle(false);

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
    const periodsFormat = dates.map((date) => {
      return {
        ...(violationType === "Custom" ? customPeriodFormat : periodFormat),
        start_date: date.start_date,
        end_date: date.end_date,
        rate: employee ? `${employee.rate}` : "",
      };
    });

    if (violationType === "Custom") {
      setCustomViolationType((draft) => {
        draft.periods.push(...(periodsFormat as CustomPeriod[]));
      });
    } else {
      setViolationValues((draft) => {
        draft[violationType][paymentType].push(...(periodsFormat as Period[]));
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const saveViolations = async (
        violationTypes: ViolationValues,
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

      const handleBackPress = () => {
        router.push("/employees");
        saveViolations(violationValues, customViolationType);
        return true;
      };

      const appStateHandler = AppState.addEventListener(
        "change",
        (nextAppState) => {
          nextAppState === "background" &&
            saveViolations(violationValues, customViolationType);
        },
      );

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => {
        backhandler.remove();
        appStateHandler.remove();
      };
    }, [db, router, employee_id, violationValues, customViolationType]),
  );

  return (
    <>
      {wageOrders &&
        holidays &&
        establishment &&
        employee &&
        violationValues && (
          <>
            <SafeAreaView className="flex-1 bg-primary">
              <NavBar />

              <View className="flex-row items-center justify-between gap-2 p-2.5">
                <View className="w-[64%]">
                  <Text className="font-b text-xl">
                    {`${employee.last_name}, ${employee.first_name}${["na", "n/a"].includes(employee.middle_initial.toLowerCase()) ? "" : ` ${employee.middle_initial}.`}`}
                  </Text>

                  <Text className="font-b text-xl">
                    Subtotal:{" "}
                    {formatNumber(
                      violationType === "Custom"
                        ? customViolationHandlers.getTotal()
                        : getTotal(
                            wageOrders,
                            violationType,
                            paymentType,
                            establishment.size,
                            violationValues[violationType][paymentType],
                          ),
                    )}
                  </Text>
                </View>

                <View className="w-[34%]">
                  <AddPeriodModal
                    form={form}
                    isVisible={isAddPeriodModalVisible}
                    onToggle={handleAddPeriodModalToggle}
                    onSubmit={handleAddPeriodModalSubmit}
                  />
                </View>
              </View>

              <View className="gap-2 border-b border-b-[#333] bg-primary p-2.5">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-1">
                    {getTabs(establishment.size).map((tab) => (
                      <TouchableOpacity
                        key={tab.name}
                        onPress={() =>
                          setViolationType(tab.name as ViolationType)
                        }
                      >
                        <Text
                          className={`${violationType === tab.name ? "text-white" : ""}`}
                        >
                          {tab.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setPaymentType("Underpayment")}
                  >
                    <Text
                      className={`${paymentType === "Underpayment" ? "text-white" : ""}`}
                    >
                      Underpayment
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPaymentType("Non-payment")}
                  >
                    <Text
                      className={`${paymentType === "Non-payment" ? "text-white" : ""}`}
                    >
                      Non-payment
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="mt-6 h-[73%] px-4"
              >
                <ScrollView>
                  <View className="gap-7">
                    {violationType === "Custom" ? (
                      <>
                        {customViolationType.periods.map((_, index) => (
                          <CustomViolationForm
                            key={index}
                            index={index}
                            wageOrders={wageOrders}
                            establishment={establishment}
                            employee={employee}
                            customViolationType={customViolationType}
                            calculate={customViolationHandlers.calculate}
                            onChange={customViolationHandlers.handleChange}
                            onAddPeriod={
                              customViolationHandlers.handleAddPeriod
                            }
                            onRemovePeriod={
                              customViolationHandlers.handleRemovePeriod
                            }
                            onClearPeriod={
                              customViolationHandlers.handleClearPeriod
                            }
                          />
                        ))}

                        <View className="mx-10 rounded-[0.625rem] bg-white p-2.5">
                          <Label name="Received" color="#333" />

                          <TextInput
                            className="rounded-md border border-black px-2.5 font-r"
                            keyboardType="numeric"
                            placeholder="Enter pay received"
                            value={customViolationType.received}
                            onChangeText={(value) =>
                              customViolationHandlers.handleReceivedChange(
                                value,
                              )
                            }
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        {violationPeriods.map((_, index) => (
                          <Form
                            key={index}
                            violationType={violationType}
                            paymentType={paymentType}
                            index={index}
                            wageOrders={wageOrders}
                            holidays={holidays}
                            establishment={establishment}
                            employee={employee}
                            violationValues={violationValues}
                            onChange={violationHandlers.handleChange}
                            onAddPeriod={violationHandlers.handleAddPeriod}
                            onRemovePeriod={
                              violationHandlers.handleRemovePeriod
                            }
                            onClearPeriod={violationHandlers.handleClearPeriod}
                          />
                        ))}
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
