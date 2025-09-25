import confirmAlert from "@/components/ConfirmAlert";
import AddEmployeeModal from "@/components/Modal/AddEmployeeModal";
import UpdateEmployeeModal from "@/components/Modal/UpdateEmployeeModal";
import NavBar from "@/components/NavBar";
import { employees, establishments, violations } from "@/db/schema";
import { Employee, Establishment } from "@/types/globals";
import { getDb } from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { eq } from "drizzle-orm";
import { Href, useRouter } from "expo-router";
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
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

const EmployeesPage = () => {
  const db = getDb();
  const router = useRouter();

  const [parent, setParent] = useState<Establishment | null>(null);
  const [records, setRecords] = useState<Employee[]>([]);
  const [mutations, setMutations] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = records.filter((record) => {
    return Object.values(record).some((value) => {
      return `${value}`.toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const deleteRecord = async (id: number) => {
    try {
      await db.delete(violations).where(eq(violations.employee_id, id));
      await db.delete(employees).where(eq(employees.id, id));
      setMutations((prev) => ++prev);
      Toast.show({
        type: "success",
        text1: "Deleted Employee",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
      });
    }
  };

  const setEmployee = (id: number) => {
    SessionStorage.setItem("employee_id", `${id}`);
    router.push("/calculator" as Href);
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        router.push("/" as Href);
        return true;
      };

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => backhandler.remove();
    }, []),
  );

  useEffect(() => {
    const getRecords = async () => {
      try {
        const parent_id = SessionStorage.getItem("establishment_id") as string;
        const data = await db.query.establishments.findFirst({
          where: eq(establishments.id, Number(parent_id)),
          with: { employees: true },
        });
        if (data && data.employees) {
          setParent(data);
          setRecords(data.employees);
        }
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
    <>
      {parent && records && (
        <>
          <NavBar />

          <View style={tw`flex-1 bg-[#f2f2f2] p-4`}>
            <Text style={tw`text-lg font-bold text-center mb-3`}>
              {parent.name}
            </Text>

            <TextInput
              placeholder="Search employee"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={tw`border border-[#ccc] rounded-lg p-2.5 mb-2.5 text-base`}
            />

            <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
              <View style={tw`bg-white rounded-[10px] overflow-hidden`}>
                <View style={tw`flex-row items-center py-3 px-2 bg-[#2196F3]`}>
                  <Text
                    style={tw.style(`font-bold text-white text-base`, {
                      flex: 2,
                    })}
                  >
                    Name
                  </Text>
                  <Text
                    style={tw.style(`font-bold text-white text-base`, {
                      flex: 1,
                    })}
                  >
                    Rate
                  </Text>
                  <Text
                    style={tw.style(`font-bold text-white text-base`, {
                      flex: 2,
                    })}
                  >
                    Work Week
                  </Text>
                  <Text
                    style={tw.style(`font-bold text-white text-base`, {
                      flex: 1.5,
                    })}
                  >
                    Actions
                  </Text>
                </View>

                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <View
                      key={record.id}
                      style={tw`flex-row items-center py-2.5 px-2`}
                    >
                      <Text
                        style={tw.style(`text-[#333] text-sm`, {
                          flex: 2,
                        })}
                      >
                        {record.first_name} {record.last_name}
                      </Text>
                      <Text
                        style={tw.style(`text-[#333] text-sm`, {
                          flex: 1,
                        })}
                      >
                        {record.rate}
                      </Text>
                      <Text
                        style={tw.style(`text-[#333] text-sm`, {
                          flex: 2,
                        })}
                      >
                        {record.start_day.slice(0, 3)} -{" "}
                        {record.end_day.slice(0, 3)}
                      </Text>

                      <View
                        style={tw.style(`flex-row justify-around`, {
                          flex: 1.5,
                        })}
                      >
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
                          values={record}
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
                  <Text style={tw`text-center my-2.5`}>
                    No employees found.
                  </Text>
                )}
              </View>
            </ScrollView>

            <AddEmployeeModal
              parent={parent}
              db={db}
              setMutations={setMutations}
            />
          </View>
        </>
      )}
    </>
  );
};

export default EmployeesPage;
