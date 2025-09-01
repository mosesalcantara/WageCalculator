import confirmAlert from "@/components/ConfirmAlert";
import AddEstablishmentModal from "@/components/Modal/AddEstablishmentModal";
import UpdateEstablishmentModal from "@/components/Modal/UpdateEstablishmentModal";
import NavBar from "@/components/NavBar";
import { employees, establishments } from "@/db/schema";
import { getDb } from "@/utils/utils";
import { useFocusEffect } from "@react-navigation/native";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const EstablishmentPage = () => {
  const db = getDb();
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [mutations, setMutations] = useState(0);

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

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        BackHandler.exitApp();
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
    <View style={styles.container}>
      <NavBar />

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

              <UpdateEstablishmentModal
                db={db}
                setMutations={setMutations}
                values={item}
              />

              <TouchableOpacity
                onPress={() =>
                  confirmAlert("Establishment", deleteRecord, item.id)
                }
              >
                <Icon name="delete" size={20} color="#E53935" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEstablishment(item.id, "pdf")}
              >
                <Icon name="file-download" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <AddEstablishmentModal db={db} setMutations={setMutations} />
    </View>
  );
};

export default EstablishmentPage;
