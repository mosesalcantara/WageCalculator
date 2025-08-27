import confirmAlert from "@/components/ConfirmAlert";
import AddEstablishmentModal from "@/components/Modal/AddEstablishmentModal";
import UpdateEstablishmentModal from "@/components/Modal/UpdateEstablishmentModal";
import NavBar from "@/components/NavBar";
import * as schema from "@/db/schema";
import { employees, establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Link, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const EstablishmentPage = () => {
  const router = useRouter();
  const initialDb = useSQLiteContext();
  const db = drizzle(initialDb, { schema });

  const [records, setRecords] = useState([]);
  const [values, setValues] = useState({
    id: "",
    name: "",
    type: "",
    address: "",
  });

  const [mutations, setMutations] = useState(0);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const deleteRecord = async (id) => {
    await db.delete(establishments).where(eq(establishments.id, id));
    await db.delete(employees).where(eq(employees.establishment_id, id));
    setMutations((prev) => ++prev);
  };

  const setEstablishment = (id, route) => {
    SessionStorage.setItem("establishment_id", `${id}`);
    router.push(`/${route}`);
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.establishments.findMany({
        with: {
          employees: true,
        },
      });
      setRecords(data);
    };

    getRecords();
  }, [mutations]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavBar />

      {/* List of establishments */}
      <FlatList
        data={records}
        keyExtractor={(record) => record.id}
        renderItem={({ item }) => (
          <View style={styles.establishmentCard}>
            <Text style={styles.establishmentText}>{item.name}</Text>

            <View style={{ flexDirection: "row", gap: 3 }}>
              <TouchableOpacity
                onPress={() => setEstablishment(item.id, "employees")}
              >
                <Icon name="remove-red-eye" size={20} color="#2196F3" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setValues(item);
                  setIsUpdateModalVisible(true);
                }}
              >
                <Icon name="edit" size={20} color="#2196F3" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  confirmAlert("Establishment", deleteRecord, item.id);
                }}
              >
                <Icon name="delete" size={20} color="#E53935" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setEstablishment(item.id, "pdf");
                }}
              >
                <Icon name="file-download" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <AddEstablishmentModal db={db} setMutations={setMutations} />
      <UpdateEstablishmentModal
        db={db}
        setMutations={setMutations}
        values={values}
        isUpdateModalVisibleState={[
          isUpdateModalVisible,
          setIsUpdateModalVisible,
        ]}
      />
    </View>
  );
};

export default EstablishmentPage;
