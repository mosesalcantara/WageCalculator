import BagongPilipinasImage from "@/assets/images/bagongpilipinas.png";
import DoleImage from "@/assets/images/dole.png";
import Form from "@/components/Calculator/Form";
import { employees, violations } from "@/db/schema";
import { formatNumber, getDb, getTotals, inputFormat } from "@/utils/utils";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import {
  Alert,
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

  const tabs = [
    { name: "Basic Wage", icon: "payments" },
    { name: "Overtime Pay", icon: "access-time" },
    { name: "Night Differential", icon: "nights-stay" },
    { name: "Special Day", icon: "star" },
    { name: "Rest Day", icon: "star" },
    { name: "Holiday Pay", icon: "event-available" },
    { name: "13th Month Pay", icon: "card-giftcard" },
  ];

  const parent_id = SessionStorage.getItem("employee_id");
  const [parent, setParent] = useState({
    id: parent_id,
    first_name: "",
    last_name: "",
    rate: "",
    establishment_id: "",
  });

  const [type, setType] = useState("Basic Wage");

  const [values, setValues] = useState({
    "Basic Wage": { inputs: [inputFormat] },
    "Overtime Pay": { inputs: [inputFormat] },
    "Night Differential": { inputs: [inputFormat] },
    "Special Day": { inputs: [inputFormat] },
    "Rest Day": { inputs: [inputFormat] },
    "Holiday Pay": { inputs: [inputFormat] },
    "13th Month Pay": {
      inputs: [inputFormat],
      received: "",
    },
  });

  const addRecord = async () => {
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

  const handleInitialChange = (index, key, value) => {
    if (key.endsWith("_date")) {
      value = value.toISOString().split("T")[0];
    }

    if (key == "received") {
      setValues((prev) => {
        return {
          ...prev,
          [type]: {
            inputs: prev[type].inputs,
            [key]: value,
          },
        };
      });
    } else {
      setValues((prev) => {
        const updatedInputs = prev[type].inputs.map((input, inputIndex) => {
          if (index == inputIndex) {
            return {
              ...input,
              [key]: `${value}`,
            };
          } else return input;
        });

        return {
          ...prev,
          [type]: {
            ...prev[type],
            inputs: updatedInputs,
          },
        };
      });
    }
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.employees.findFirst({
        where: eq(employees.id, parent_id),
        with: { violations: true },
      });

      setParent(data);
      data.violations && setValues(JSON.parse(data.violations[0].values));
    };

    getRecords();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="assignment" size={22} color="#fff" />
        <Text style={styles.headerText}>Inspector Wage Calculator</Text>
        <View style={styles.header}>
          <Image source={DoleImage} style={styles.image} />
          <Image source={BagongPilipinasImage} style={styles.image} />
        </View>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calcScroll}
        >
          {tabs.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.calcButton,
                type === item.name && styles.calcButtonActive,
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
                  styles.calcButtonText,
                  type === item.name && { color: "#fff" },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ paddingVertical: 15 }}>
        <Text style={{ fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
          {`${parent.first_name} ${parent.last_name} - ${formatNumber(
            parent.rate
          )}`}
        </Text>
        <Text style={{ fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
          Subtotal: {formatNumber(getTotals(values, type, parent.rate))}
        </Text>
      </View>

      <View style={{ height: 450 }}>
        <ScrollView>
          <View style={{ gap: 30 }}>
            {values[type].inputs.map((_, index) => (
              <Form
                key={index}
                db={db}
                parent={parent}
                type={type}
                index={index}
                valuesState={[values, setValues]}
                handleInitialChange={handleInitialChange}
              />
            ))}
          </View>

          <View style={{ marginHorizontal: 40, paddingTop: 10 }}>
            {type == "13th Month Pay" && (
              <>
                <Text style={styles.label}>Received</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Enter pay received"
                  value={values[type].received}
                  onChangeText={(value) =>
                    handleInitialChange(null, "received", value)
                  }
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={{ marginHorizontal: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#000",
            padding: 12,
            borderRadius: 30,
            marginTop: 20,
            marginBottom: 30,
          }}
          onPress={addRecord}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CalculatorPage;
