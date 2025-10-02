import Form from "@/components/Calculator/Form";
import NavBar from "@/components/NavBar";
import { violations } from "@/db/schema";
import useFetchViolations from "@/hooks/useFetchViolations";
import { ViolationTypes, ViolationValues } from "@/types/globals";
import { formatNumber, getDb, getTotal } from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
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
  const { parent, values, setValues } = useFetchViolations(db);

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
      {parent && values && (
        <>
          <View className="flex-1 bg-[#f5f5f5]">
            <NavBar />

            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="border-b border-b-[#ddd] bg-white py-2.5"
              >
                {tabs.map((tab) => (
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

            <View className="flex-row items-center justify-between px-2.5">
              <View className="py-2.5">
                <Text className="ml-1.5 text-xl font-bold">
                  {`${parent.first_name} ${parent.last_name} - ${formatNumber(
                    parent.rate,
                  )}`}
                </Text>
                <Text className="ml-1.5 text-xl font-bold underline">
                  Subtotal:{" "}
                  {formatNumber(getTotal(values[type], parent.rate, type))}
                </Text>
              </View>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="h-[41rem]"
            >
              <ScrollView>
                <View className="gap-[1.875rem]">
                  {values[type].periods.map((_, index) => (
                    <Form
                      key={index}
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
                      value={values[type].received}
                      onChangeText={(value) => handleReceivedChange(value)}
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
