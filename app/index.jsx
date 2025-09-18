import confirmAlert from "@/components/ConfirmAlert";
import AddEstablishmentModal from "@/components/Modal/AddEstablishmentModal";
import UpdateEstablishmentModal from "@/components/Modal/UpdateEstablishmentModal";
import NavBar from "@/components/NavBar";
import { employees, establishments, violations } from "@/db/schema";
import { getDb } from "@/utils/utils";
import { useFocusEffect } from "@react-navigation/native";
import { eq, inArray } from "drizzle-orm";
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
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const EstablishmentPage = () => {
  const db = getDb();
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [mutations, setMutations] = useState(0);

  const deleteRecord = async (id) => {
    try {
      const data = await db.query.establishments.findFirst({
        where: eq(establishments.id, id),
        with: { employees: true },
      });
      const ids = data.employees.map((employee) => employee.id);
      await db.delete(violations).where(inArray(violations.employee_id, ids));
      await db.delete(employees).where(eq(employees.establishment_id, id));
      await db.delete(establishments).where(eq(establishments.id, id));
      setMutations((prev) => ++prev);
      Toast.show({
        type: "success",
        text1: "Deleted Establishment",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
      });
    }
  };

  const setEstablishment = (id, route) => {
    SessionStorage.setItem("establishment_id", `${id}`);
    router.push(`/${route}`);
  };

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

  useEffect(() => {
    const getRecords = async () => {
      try {
        const data = await db.query.establishments.findMany({
          with: { employees: true },
        });
        setRecords(data);
      } catch (error) {
        console.error(error);
        Toast.show({
          type: "error",
          text1: "An Error Has Occured. Please Try Again.",
        });
      }
    };
    getRecords();
  }, [mutations]);

  return (
    <View style={styles.container}>
      <NavBar />

      <FlatList
        data={records}
        keyExtractor={(record) => record.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.name}</Text>

            <View style={styles.icons}>
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
