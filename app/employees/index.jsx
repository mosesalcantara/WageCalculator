import confirmAlert from "@/components/ConfirmAlert";
import AddEmployeeModal from "@/components/Modal/AddEmployeeModal";
import UpdateEmployeeModal from "@/components/Modal/UpdateEmployeeModal";
import NavBar from "@/components/NavBar";
import { employees, establishments, violations } from "@/db/schema";
import { getDb } from "@/utils/utils";
import { useFocusEffect } from "@react-navigation/native";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const EmployeesPage = () => {
  const db = getDb();
  const router = useRouter();

  const [parent, setParent] = useState(null);
  const [records, setRecords] = useState([]);
  const [mutations, setMutations] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = records.filter((record) => {
    return Object.values(record).some((value) => {
      return `${value}`.toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const deleteRecord = async (id) => {
    await db.delete(violations).where(eq(violations.employee_id, id));
    await db.delete(employees).where(eq(employees.id, id));
    setMutations((prev) => ++prev);
  };

  const setEmployee = (id) => {
    SessionStorage.setItem("employee_id", `${id}`);
    router.push("/calculator");
  };

  useEffect(() => {
    const getRecords = async () => {
      const parent_id = SessionStorage.getItem("establishment_id");
      const data = await db.query.establishments.findFirst({
        where: eq(establishments.id, parent_id),
        with: { employees: true },
      });
      setParent(data);
      setRecords(data.employees);
    };
    getRecords();
  }, [mutations]);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        router.push("/");
        return true;
      };

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => backhandler.remove();
    }, [])
  );

  return (
    <>
      {parent && records && (
        <>
          <NavBar />

          <View style={styles.container}>
            <Text style={styles.title}>{parent.name}</Text>

            <TextInput
              placeholder="Search employee"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                fontSize: 16,
              }}
            />

            <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
              <View style={[styles.table, { width: 361 }]}>
                <View style={[styles.row, styles.headerRow]}>
                  <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>
                    Name
                  </Text>
                  <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                    Rate
                  </Text>
                  <Text style={[styles.cell, styles.headerCell, { flex: 0.8 }]}>
                    Actions
                  </Text>
                </View>

                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <View key={record.id} style={[styles.row]}>
                      <Text style={[styles.cellText, { flex: 2 }]}>
                        {record.first_name} {record.last_name}
                      </Text>
                      <Text style={[styles.cellText, { flex: 1 }]}>
                        {record.rate}
                      </Text>

                      <View style={[styles.actionCell, { flex: 0.8 }]}>
                        <TouchableOpacity
                          onPress={() => setEmployee(record.id)}
                        >
                          <Icon
                            name="remove-red-eye"
                            size={20}
                            color="#2196F3"
                          />
                        </TouchableOpacity>

                        <UpdateEmployeeModal
                          db={db}
                          setMutations={setMutations}
                          values={{ ...record, rate: `${record.rate}` }}
                        />

                        <TouchableOpacity
                          onPress={() => {
                            confirmAlert("Employee", deleteRecord, record.id);
                          }}
                        >
                          <Icon name="delete" size={20} color="#E53935" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: "center", marginVertical: 10 }}>
                    No employees found.
                  </Text>
                )}
              </View>
            </ScrollView>

            <AddEmployeeModal
              db={db}
              setMutations={setMutations}
              parent={parent}
            />
          </View>
        </>
      )}
    </>
  );
};

export default EmployeesPage;
