import BagongPilipinas from "@/assets/images/bagongpilipinas.png";
import Dole from "@/assets/images/dole.png";
import Form from "@/components/Calculator/Form";
import { employees, violations } from "@/db/schema";
import { formatNumber, getDb, getTotals, periodsFormat } from "@/utils/utils";
import { useFocusEffect } from "@react-navigation/native";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const CalculatorPage = () => {
  const db = getDb();
  const router = useRouter();
  const parent_id = SessionStorage.getItem("employee_id");

  const tabs = [
    { name: "Basic Wage", icon: "payments" },
    { name: "Overtime Pay", icon: "access-time" },
    { name: "Night Differential", icon: "nights-stay" },
    { name: "Special Day", icon: "star" },
    { name: "Rest Day", icon: "coffee" },
    { name: "Holiday Pay", icon: "event-available" },
    { name: "13th Month Pay", icon: "card-giftcard" },
  ];

  const [type, setType] = useState("Basic Wage");
  const [parent, setParent] = useState(null);
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

  const handleInitialChange = (key, value, index) => {
    if (key.endsWith("_date")) {
      value = value.toISOString().split("T")[0];
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

  const addRecord = async (values) => {
    try {
      await db.delete(violations).where(eq(violations.employee_id, parent_id));
      await db
        .insert(violations)
        .values({ values: JSON.stringify(values), employee_id: parent_id });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "An Error Eccurred");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        router.push("/employees");
        addRecord(values);
        return true;
      };

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => backhandler.remove();
    }, [values])
  );

  useEffect(() => {
    const getRecords = async () => {
      try {
        const data = await db.query.employees.findFirst({
          where: eq(employees.id, parent_id),
          with: { violations: true },
        });
        setParent(data);
        data.violations.length > 0 &&
          setValues(JSON.parse(data.violations[0].values));
      } catch (error) {
        console.error(error);
        Alert.alert("Error", error.message || "An Error Eccurred");
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
                <Image source={Dole} style={styles.image} />
                <Image source={BagongPilipinas} style={styles.image} />
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
                    onPress={() => {
                      setType(item.name);
                    }}
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

            <View style={styles.employeeContainer}>
              <Text style={styles.employee}>
                {`${parent.first_name} ${parent.last_name} - ${formatNumber(
                  parent.rate
                )}`}
              </Text>
              <Text style={styles.subtotal}>
                Subtotal:{" "}
                {formatNumber(getTotals(values[type], parent.rate, type))}
              </Text>
            </View>

            <View style={styles.periodsContainer}>
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
                        handleInitialChange("received", value, null)
                      }
                    />
                  </View>
                )}

                <Text style={{ ...styles.footer, marginTop: 120 }}>
                  Copyright © 2025 - Department of Labor and Employment
                </Text>
                <Text style={{ ...styles.footer, marginBottom: 10 }}>
                  MIMAROPA Region
                </Text>
              </ScrollView>
            </View>

            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => addRecord(values)}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default CalculatorPage;
