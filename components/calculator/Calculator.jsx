import BagongPilipinasImage from "@/assets/images/bagongpilipinas.png";
import DoleImage from "@/assets/images/dole.png";
import Form from "@/components/Calculator/Form";
import { styles } from "@/components/Calculator/styles";
import { employees, violations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const Calculator = ({ db }) => {
  const parent_id = SessionStorage.getItem("employee_id");

  const tabs = [
    { name: "Basic Wage", icon: "payments" },
    { name: "Holiday Pay", icon: "event-available" },
    { name: "Premium Pay", icon: "star" },
    { name: "Overtime Pay", icon: "access-time" },
    { name: "Night Differential", icon: "nights-stay" },
    { name: "13th Month Pay", icon: "card-giftcard" },
  ];

  const [parent, setParent] = useState({
    id: parent_id,
    first_name: "",
    last_name: "",
    rate: "",
    establishment_id: "",
  });

  const [selectedTab, setSelectedTab] = useState("Basic Wage");

  const [values, setValues] = useState({
    "Basic Wage": {
      start_date: "",
      end_date: "",
      daysOrHours: "",
      total: "",
    },
    "Holiday Pay": {
      start_date: "",
      end_date: "",
      daysOrHours: "",
      total: "",
    },
    "Premium Pay": {
      start_date: "",
      end_date: "",
      daysOrHours: "",
      total: "",
    },
    "Overtime Pay": {
      start_date: "",
      end_date: "",
      daysOrHours: "",
      total: "",
    },
    "Night Differential": {
      start_date: "",
      end_date: "",
      daysOrHours: "",
      total: "",
    },
    "13th Month Pay": {
      start_date: "",
      end_date: "",
      daysOrHours: "",
      total: "",
      received: "",
    },
  });

  const handleChange = (type, key, value) => {
    if (key.endsWith("_date")) {
      value = value.toISOString().split("T")[0];
    }

    setValues((prev) => ({
      ...prev,
      [type]: {
        ...values[type],
        [key]: value,
      },
    }));
  };

  const renderForm = () => {
    return (
      <Form
        db={db}
        parent={parent}
        type={selectedTab}
        valuesState={[values, setValues]}
        handleInitialChange={handleChange}
      />
    );
  };

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
    const handleBackPress = () => {
      console.log(5);
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    const getRecords = async () => {
      const parentQuery = await db.query.employees.findFirst({
        where: eq(employees.id, parent_id),
      });
      setParent(parentQuery);

      const violationsQuery = await db.query.violations.findFirst({
        where: eq(violations.employee_id, parent_id),
      });

      const values = JSON.parse(violationsQuery.values);
      setValues(values);
    };

    getRecords();

    return () => backHandler.remove();
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
                selectedTab === item.name && styles.calcButtonActive,
              ]}
              onPress={() => {
                setSelectedTab(item.name);
              }}
            >
              <Icon
                name={item.icon}
                size={18}
                color={selectedTab === item.name ? "#fff" : "#555"}
              />
              <Text
                style={[
                  styles.calcButtonText,
                  selectedTab === item.name && { color: "#fff" },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View>
        <ScrollView style={styles.content}>
          <View style={styles.card}>{renderForm(selectedTab)}</View>
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
