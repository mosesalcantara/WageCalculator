import confirmAlert from "@/components/ConfirmAlert";
import AddEmployeeModal from "@/components/Modal/AddEmployeeModal";
import UpdateEmployeeModal from "@/components/Modal/UpdateEmployeeModal";
import NavBar from "@/components/NavBar";
import { employees, establishments, violations } from "@/db/schema";
import { getDb } from "@/utils/utils";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const EmployeesPage = () => {
  const router = useRouter();
  const parent_id = SessionStorage.getItem("establishment_id");

  const db = getDb();

  const [parent, setParent] = useState({
    id: parent_id,
    name: "",
  });
  const [records, setRecords] = useState([]);
  const [values, setValues] = useState({
    id: "",
    first_name: "",
    last_name: "",
    rate: "",
  });

  const [mutations, setMutations] = useState(0);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const deleteRecord = async (id) => {
    await db.delete(employees).where(eq(employees.id, id));
    await db.delete(violations).where(eq(violations.employee_id, id));
    setMutations((prev) => ++prev);
  };

  const setEmployee = (id) => {
    SessionStorage.setItem("employee_id", `${id}`);
    router.push("/calculator");
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.establishments.findFirst({
        where: eq(establishments.id, parent.id),
        with: {
          employees: true,
        },
      });
      setParent(data);
      setRecords(data.employees);
    };

    getRecords();
  }, [mutations]);

  return (
    <>
      <NavBar />

      <View style={styles.container}>
        <Text style={styles.title}>{parent.name} - Employees</Text>

        <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
          <View style={[styles.table, { width: 361 }]}>
            {/* Table Header */}
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

            {/* Table Rows */}
            {records.map((record, index) => (
              <View
                key={index}
                style={[
                  styles.row,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}
              >
                <Text style={[styles.cellText, { flex: 2 }]}>
                  {record.first_name} {record.last_name}
                </Text>
                <Text style={[styles.cellText, { flex: 1 }]}>
                  {record.rate}
                </Text>

                <View style={[styles.actionCell, { flex: 0.8 }]}>
                  <TouchableOpacity onPress={() => setEmployee(record.id)}>
                    <Icon name="remove-red-eye" size={20} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setValues({ ...record, rate: `${record.rate}` });
                      setIsUpdateModalVisible(true);
                    }}
                  >
                    <Icon name="edit" size={20} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      confirmAlert("Employee", deleteRecord, record.id);
                    }}
                  >
                    <Icon name="delete" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <AddEmployeeModal db={db} setMutations={setMutations} parent={parent} />
        <UpdateEmployeeModal
          db={db}
          setMutations={setMutations}
          values={values}
          isUpdateModalVisibleState={[
            isUpdateModalVisible,
            setIsUpdateModalVisible,
          ]}
        />
      </View>
    </>
  );
};

export default EmployeesPage;
