import BagongPilipinasImage from "@/assets/images/bagongpilipinas.png";
import DoleImage from "@/assets/images/dole.png";
import Form from "@/components/Calculator/Form";
import * as schema from "@/db/schema";
import { employees, violations } from "@/db/schema";
import { formatNumber, inputFormat } from "@/utils/utils";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const Calculator = () => {
  const initialDb = useSQLiteContext();
  const db = drizzle(initialDb, { schema });

  const tabs = [
    { name: "Basic Wage", icon: "payments" },
    { name: "Holiday Pay", icon: "event-available" },
    { name: "Premium Pay", icon: "star" },
    { name: "Overtime Pay", icon: "access-time" },
    { name: "Night Differential", icon: "nights-stay" },
    { name: "13th Month Pay", icon: "card-giftcard" },
  ];

  const parent_id = SessionStorage.getItem("employee_id");
  const [parent, setParent] = useState({
    id: parent_id,
    first_name: "",
    last_name: "",
    rate: "",
    establishment_id: "",
    violations: "",
  });

  const [type, setType] = useState("Basic Wage");

  const [values, setValues] = useState({
    "Basic Wage": { inputs: [inputFormat], subtotal: "" },
    "Holiday Pay": { inputs: [inputFormat], subtotal: "" },
    "Premium Pay": { inputs: [inputFormat], subtotal: "" },
    "Overtime Pay": { inputs: [inputFormat], subtotal: "" },
    "Night Differential": { inputs: [inputFormat], subtotal: "" },
    "13th Month Pay": {
      inputs: [{ ...inputFormat, received: "" }],
      subtotal: "",
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

  useEffect(() => {
    const getRecords = async () => {
      const parentQuery = await db.query.employees.findFirst({
        where: eq(employees.id, parent_id),
      });

      const violationsQuery = await db.query.violations.findFirst({
        where: eq(violations.employee_id, parent_id),
      });

      if (violationsQuery) {
        const valuesJSONString = JSON.parse(violationsQuery.values);

        setParent({
          ...parentQuery,
          violations: valuesJSONString,
        });

        setValues(valuesJSONString);
      } else {
        setParent({
          ...parentQuery,
          violations: values,
        });
      }
    };

    getRecords();
  }, [values]);

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
          Subtotal: {formatNumber(values[type].subtotal)}
        </Text>
      </View>

      <View style={{ height: 450 }}>
        <ScrollView>
          <View style={{ gap: 30 }}>
            {values[type].inputs.map((input, index) => (
              <Form
                key={index}
                db={db}
                parent={parent}
                type={type}
                index={index}
                valuesState={[values, setValues]}
              />
            ))}
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

export default Calculator;
