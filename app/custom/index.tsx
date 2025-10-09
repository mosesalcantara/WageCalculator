import Form from "@/components/Custom/Form";
import NavBar from "@/components/NavBar";
import { CustomPeriod } from "@/types/globals";
import { customPeriodFormat, formatNumber } from "@/utils/globals";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomPage = () => {
  const [periods, setPeriods] = useState([customPeriodFormat]);

  const getTotal = (period: CustomPeriod) => {
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

  const getSubtotal = () => {
    let subtotal = 0;
    periods.forEach((period) => {
      subtotal += getTotal(period).total;
    });
    return subtotal;
  };

  const subtotal = getSubtotal();

  return (
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <NavBar />

      <View className="flex-row items-center justify-between px-4">
        <View className="py-2.5">
          <Text className="ml-1.5 text-xl font-bold">
            Subtotal: {formatNumber(subtotal)}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="h-[42rem] px-4"
      >
        <ScrollView>
          <View className="gap-7">
            {periods.map((_, index) => (
              <Form
                key={index}
                index={index}
                periodsState={[periods, setPeriods]}
                getTotal={getTotal}
              />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomPage;
