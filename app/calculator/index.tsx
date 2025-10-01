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
import tw from "twrnc";

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
          <View style={tw`flex-1 bg-[#f5f5f5]`}>
            <NavBar />

            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={tw`bg-white border-b border-b-[#ddd] py-2.5`}
              >
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.name}
                    style={tw.style(
                      `flex-row items-center border border-[#ccc] rounded-lg bg-white px-3 mx-[0.3125rem] h-10`,
                      type === tab.name && `bg-[#2c3e50] border-[#2c3e50]`,
                    )}
                    onPress={() => setType(tab.name as ViolationTypes)}
                  >
                    <Icon
                      name={tab.icon}
                      size={18}
                      color={type === tab.name ? "#fff" : "#555"}
                    />
                    <Text
                      style={tw.style(
                        `ml-1.5 text-sm text-[#555]`,
                        type === tab.name && `text-white`,
                      )}
                    >
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={tw`flex-row justify-between items-center px-2.5`}>
              <View style={tw`py-2.5`}>
                <Text style={tw`font-bold text-xl ml-1.5`}>
                  {`${parent.first_name} ${parent.last_name} - ${formatNumber(
                    parent.rate,
                  )}`}
                </Text>
                <Text style={tw`font-bold text-xl underline ml-1.5`}>
                  Subtotal:{" "}
                  {formatNumber(getTotal(values[type], parent.rate, type))}
                </Text>
              </View>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={tw`h-[31.25rem]`}
            >
              <ScrollView>
                <View style={tw`gap-[1.875rem]`}>
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
                  <View style={tw`mx-10 pt-4]`}>
                    <Text style={tw`text-sm font-bold mt-2.5 mb-1 text-[#333]`}>
                      Received
                    </Text>
                    <TextInput
                      style={tw`border border-[#ccc] rounded-md px-2.5 bg-[#fafafa] h-10`}
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
