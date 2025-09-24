import Form from "@/components/Calculator/Form";
import { employees, violations } from "@/db/schema";
import {
  Employee,
  Violations,
  ViolationTypes,
  ViolationValues,
} from "@/types/globals";
import { formatNumber, getDb, getTotal, periodsFormat } from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { eq } from "drizzle-orm";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  BackHandler,
  Image,
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
import styles from "./styles";

const CalculatorPage = () => {
  const db = getDb();
  const router = useRouter();
  const parent_id = SessionStorage.getItem("employee_id") as string;

  const tabs = [
    { name: "Basic Wage", icon: "payments" },
    { name: "Overtime Pay", icon: "access-time" },
    { name: "Night Differential", icon: "nights-stay" },
    { name: "Special Day", icon: "star" },
    { name: "Rest Day", icon: "coffee" },
    { name: "Holiday Pay", icon: "event-available" },
    { name: "13th Month Pay", icon: "card-giftcard" },
  ];

  const [type, setType] = useState<ViolationTypes>("Basic Wage");
  const [parent, setParent] = useState<Employee | null>(null);
  const [values, setValues] = useState({
    "Basic Wage": periodsFormat,
    "Overtime Pay": periodsFormat,
    "Night Differential": periodsFormat,
    "Special Day": periodsFormat,
    "Rest Day": periodsFormat,
    "Holiday Pay": periodsFormat,
    "13th Month Pay": {
      ...periodsFormat,
      received: "",
    },
  });

  const handleInitialChange = (
    key: string,
    value: string | number | Date,
    index?: number
  ) => {
    if (key.endsWith("_date")) {
      value = (value as Date).toISOString().split("T")[0];
    }

    if (key == "received") {
      setValues((prev) => {
        return {
          ...prev,
          [type]: { periods: prev[type].periods, [key]: value },
        };
      });
    } else {
      setValues((prev) => {
        const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
          index == periodIndex ? { ...period, [key]: `${value}` } : period
        );

        return { ...prev, [type]: { ...prev[type], periods: updatedPeriods } };
      });
    }
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
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const appStateHandler = AppState.addEventListener(
        "change",
        (nextAppState) => {
          nextAppState == "background" && addRecord(values);
        }
      );

      const handleBackPress = () => {
        router.push("/employees" as Href);
        addRecord(values);
        return true;
      };

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => {
        backhandler.remove();
        appStateHandler.remove();
      };
    }, [values])
  );

  useEffect(() => {
    const getRecords = async () => {
      try {
        const data = await db.query.employees.findFirst({
          where: eq(employees.id, Number(parent_id)),
          with: { violations: true },
        });
        if (data) {
          let violations: Violations[] = [];
          if (data.violations.length > 0) {
            violations = [
              {
                ...data.violations[0],
                values: data.violations[0].values as string,
              },
            ];
            setValues(JSON.parse(data.violations[0].values as string));
          }
          setParent({ ...data, violations: violations });
        }
      } catch (error) {
        console.error(error);
        Toast.show({
          type: "error",
          text1: "An Error Has Occured. Please Try Again.",
        });
      }
    };
    getRecords();
  }, []);

  return (
    <>
      {parent && values && (
        <>
          <View style={styles.container}>
            <View style={styles.header}>
              <Icon name="assignment" size={22} color="#fff" />
              <Text style={styles.headerText}>Inspector Wage Calculator</Text>
              <View style={styles.header}>
                <Image
                  source={require("@/assets/images/dole.png")}
                  style={styles.image}
                />
                <Image
                  source={require("@/assets/images/bagongpilipinas.png")}
                  style={styles.image}
                />
              </View>
            </View>

            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.types}
              >
                {tabs.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.button,
                      type === item.name && styles.buttonActive,
                    ]}
                    onPress={() => setType(item.name as ViolationTypes)}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      color={type === item.name ? "#fff" : "#555"}
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        type === item.name && { color: "#fff" },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.employeeSave}>
              <View style={styles.employeeContainer}>
                <Text style={styles.employee}>
                  {`${parent.first_name} ${parent.last_name} - ${formatNumber(
                    parent.rate
                  )}`}
                </Text>
                <Text style={styles.subtotal}>
                  Subtotal:{" "}
                  {formatNumber(getTotal(values[type], parent.rate, type))}
                </Text>
              </View>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.periodsContainer}
            >
              <ScrollView>
                <View style={styles.periods}>
                  {values[type].periods.map((_, index) => (
                    <Form
                      key={index}
                      parent={parent}
                      type={type}
                      index={index}
                      valuesState={[values, setValues]}
                      handleInitialChange={handleInitialChange}
                    />
                  ))}
                </View>

                {type == "13th Month Pay" && (
                  <View style={styles.receivedContainer}>
                    <Text style={styles.label}>Received</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Enter pay received"
                      value={values[type].received}
                      onChangeText={(value) =>
                        handleInitialChange("received", value)
                      }
                    />
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </>
      )}
    </>
  );
};

export default CalculatorPage;
