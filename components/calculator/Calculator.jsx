import BagongPilipinasImage from "@/assets/images/bagongpilipinas.png";
import DoleImage from "@/assets/images/dole.png";
import Form from "@/components/Calculator/Form";
import { styles } from "@/components/Calculator/styles";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const Calculator = ({ db }) => {
  const id = SessionStorage.getItem("employee_id");

  const tabs = [
    { name: "Basic Wage", icon: "payments" },
    { name: "Holiday Pay", icon: "event-available" },
    { name: "Premium Pay", icon: "star" },
    { name: "Overtime Pay", icon: "access-time" },
    { name: "Night Differential", icon: "nights-stay" },
    { name: "13th Month Pay", icon: "card-giftcard" },
  ];

  const [record, setRecord] = useState({
    id: id,
    first_name: "",
    last_name: "",
    rate: "",
    establishment_id: "",
  });

  const [selectedTab, setSelectedTab] = useState("Basic Wage");

  const renderForm = () => {
    if (["Overtime Pay", "Night Differential"].includes(selectedTab)) {
      return <Text>No Tab Selected</Text>;
    } else {
      return (
        <>
          <Form />
        </>
      );
    }
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.employees.findMany({
        where: eq(employees.id, id),
      });
      console.log(data);
      const employee = data[0];
      setRecord(employee);
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
    </View>
  );
};

export default Calculator;
