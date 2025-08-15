import AddEstablishmentModal from "@/components/AddEstablishmentModal/AddEstablishmentModal";
import NavBar from "@/components/NavBar/NavBar";
import UpdateEstablishmentModal from "@/components/UpdateEstablishmentModal/UpdateEstablishmentModal";
import * as schema from "@/db/schema";
import { establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import confirmAlert from "@/components/ConfirmAlert"

const HomeScreen = () => {
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

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.establishments.findMany();
      setRecords(data);
    };

    getRecords();
  }, [mutations]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavBar title="Wage Calculator" />

      {/* List of establishments */}
      <FlatList
        data={records}
        keyExtractor={(record) => record.id}
        renderItem={({ item }) => (
          <View style={styles.establishmentCard}>
            <Text style={styles.establishmentText}>{item.name}</Text>

            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  setValues(item);
                  setIsUpdateModalVisible(true);
                }}
              >
                <Text style={{ ...styles.establishmentText }}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  confirmAlert("Establishment", deleteRecord, item.id);
                }}
              >
                <Text style={{ ...styles.establishmentText }}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

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

export default HomeScreen;
