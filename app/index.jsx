import AddEstablishmentModal from "@/components/AddEstablishmentModal/AddEstablishmentModal";
import confirmAlert from "@/components/ConfirmAlert";
import NavBar from "@/components/NavBar/NavBar";
import UpdateEstablishmentModal from "@/components/UpdateEstablishmentModal/UpdateEstablishmentModal";
import * as schema from "@/db/schema";
import { establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Link, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./styles";

const HomePage = () => {
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
    setMutations((prev) => ++prev);
  };

  const setEstablishment = (id) => {
    SessionStorage.setItem("establishment_id", `${id}`);
    router.push("/employees");
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.establishments.findMany();
      console.log(data);
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
            <TouchableOpacity onPress={() => setEstablishment(item.id)}>
              <Text style={styles.establishmentText}>{item.name}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 15 }}>
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
            </View>
          </View>
        )}
      />

      <Link href="/calculator">Go to Calculator</Link>
      <Link href="/pdf">Go to Pdf</Link>
      <Link href="/employees">Go to Employees</Link>

      <AddEstablishmentModal db={db} setMutations={setMutations} />
      <UpdateEstablishmentModal
        db={db}
        setMutations={setMutations}
        valuesState={[values, setValues]}
        isUpdateModalVisibleState={[
          isUpdateModalVisible,
          setIsUpdateModalVisible,
        ]}
      />
    </View>
  );
};

export default HomePage;
