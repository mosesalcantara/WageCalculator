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
    violations: "",
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
      addRecord();
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    const getRecords = async () => {
      const parentQuery = await db.query.employees.findFirst({
        where: eq(employees.id, parent_id),
      });

      const violationsQuery = await db.query.violations.findFirst({
        where: eq(violations.employee_id, parent_id),
      });
      const values = JSON.parse(violationsQuery.values);

      setParent({ ...parentQuery, violations: values });
      setValues(values);
      console.log(values)
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

      <View style={{ paddingVertical: 15 }}>
        <Text style={{ fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
          {`${parent.first_name} ${parent.last_name} - ${(
            parent.rate || 0
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        </Text>
      </View>

      <View style={{ height: 450 }}>
        <ScrollView>{renderForm(selectedTab)}</ScrollView>
      </View>
    </View>
  );
};

export default Calculator;
