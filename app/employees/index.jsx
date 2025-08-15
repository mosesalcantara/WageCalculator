import AddEmployeeModal from "@/components/AddEmployeeModal/AddEmployeeModal";
import confirmAlert from "@/components/ConfirmAlert";
import NavBar from "@/components/NavBar/NavBar";
import UpdateEmployeeModal from "@/components/UpdateEmployeeModal/UpdateEmployeeModal";
import * as schema from "@/db/schema";
import { employees, establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./styles";

const EmployeesPage = () => {
  const { width: screenWidth } = Dimensions.get("window");
  const parent_id = SessionStorage.getItem("establishment_id");

  const initialDb = useSQLiteContext();
  const db = drizzle(initialDb, { schema });

  const [parent, setParent] = useState({
    id: parent_id,
    name: "",
    type: "",
    address: "",
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
    setMutations((prev) => ++prev);
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.establishments.findMany({
        where: eq(establishments.id, parent.id),
        with: {
          employees: true,
        },
      });
      console.log(data);
      const establishment = data[0];
      setParent(establishment);
      setRecords(establishment.employees);
    };

    getRecords();
  }, [mutations]);

  return (
    <>
      <NavBar />

      <View style={styles.container}>
        <Text style={styles.title}>{parent.name} - Employees</Text>

        <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
          <View style={[styles.table, { width: screenWidth - 32 }]}>
            {/* Table Header */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>
                Name
              </Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                Rate
              </Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                Underpay
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
                <Text style={[styles.cellText, { flex: 1 }]}>0</Text>
                <View style={[styles.actionCell, { flex: 0.8 }]}>
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
          valuesState={[values, setValues]}
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
