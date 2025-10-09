import confirmAlert from "@/components/ConfirmAlert";
import UpdateEmployeeModal from "@/components/Modals/UpdateEmployeeModal";
import { Db, Employee } from "@/types/globals";
import { Href, Router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  db: Db;
  router: Router;
  records: Employee[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const EmployeesTable = ({ db, router, records, refetch, onDelete }: Props) => {
  const sortedRecords = useMemo(() => {
    return records?.sort((a, b) => {
      return a.last_name < b.last_name ? -1 : a.last_name > b.last_name ? 1 : 0;
    });
  }, [records]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = useMemo(() => {
    if (sortedRecords && searchQuery) {
      return sortedRecords.filter((record) => {
        return Object.values(record).some((value) => {
          return `${value}`.toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    } else {
      return sortedRecords;
    }
  }, [sortedRecords, searchQuery]);

  const setEmployee = (id: number) => {
    SessionStorage.setItem("employee_id", `${id}`);
    router.push("/calculator" as Href);
  };

  return (
    <>
      <TextInput
        placeholder="Search employee"
        placeholderTextColor="#888"
        backgroundColor="white"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="mb-2.5 rounded-lg border border-[#333] p-2.5 text-base"
      />

      <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
        <View className="rounded-[0.625rem] bg-white">
          <View className="flex-row justify-around gap-2 bg-[#2196F3] px-2 py-3">
            <Text className="w-[35%] text-base font-bold text-white">Name</Text>
            <Text className="w-[15%] text-base font-bold text-white">Rate</Text>
            <Text className="w-1/5 text-base font-bold text-white">
              Schedule
            </Text>
            <Text className="w-1/4 text-base font-bold text-white">
              Actions
            </Text>
          </View>

          {filteredRecords && filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <View
                key={record.id}
                className="flex-row justify-around gap-2 px-2 py-2.5 text-center"
              >
                <Text className="w-[35%] text-sm text-[#333]">
                  {record.last_name}, {record.first_name}{" "}
                  {record.middle_name.slice(0, 1).toUpperCase()}.
                </Text>

                <Text className="w-[15%] text-sm text-[#333]">{record.rate}</Text>

                <Text className="w-1/5 text-sm text-[#333]">
                  {record.start_day.slice(0, 3)} - {record.end_day.slice(0, 3)}
                </Text>

                <View className="w-1/4 flex-row justify-around">
                  <TouchableOpacity onPress={() => setEmployee(record.id)}>
                    <Icon name="remove-red-eye" size={20} color="#2196F3" />
                  </TouchableOpacity>

                  <UpdateEmployeeModal
                    db={db}
                    values={record}
                    refetch={refetch}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      confirmAlert("Employee", onDelete, record.id);
                    }}
                  >
                    <Icon name="delete" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text className="my-2.5 text-center">No employees found.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default EmployeesTable;
