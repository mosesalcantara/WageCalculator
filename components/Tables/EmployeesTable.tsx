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
  employees: Employee[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const EmployeesTable = ({ db, router, employees, refetch, onDelete }: Props) => {
  const sortedEmployees = useMemo(() => {
    return employees?.sort((a, b) => {
      return a.last_name < b.last_name ? -1 : a.last_name > b.last_name ? 1 : 0;
    });
  }, [employees]);

  const [searchQuery, setSearchQuery] = useState("");

    const filteredEmployees = useMemo(() => {
    if (sortedEmployees && searchQuery) {
      return sortedEmployees.filter((employee) => {
        return Object.values(employee).some((value) => {
          return `${value}`.toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    } else {
      return sortedEmployees;
    }
  }, [sortedEmployees, searchQuery]);

  const setEmployee = (id: number) => {
    SessionStorage.setItem("employee_id", `${id}`);
    router.push("/violations" as Href);
  };

  return (
    <>
      <TextInput
        placeholder="Search employee"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="mb-2.5 rounded-lg border border-[#333] bg-white p-2.5 text-base"
      />

      <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
        <View className="rounded-[0.625rem] bg-white">
          <View className="flex-row justify-around gap-2 rounded-t-[0.625rem] bg-[#2196F3] px-2 py-3">
            <Text className="w-[38%] text-base font-bold text-white">Name</Text>
            <Text className="w-[10%] text-base font-bold text-white">Rate</Text>
            <Text className="w-1/5 text-base font-bold text-white">
              Schedule
            </Text>
            <Text className="w-[27%] text-base font-bold text-white">
              Actions
            </Text>
          </View>

          <View>
            {filteredEmployees && filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <View
                  key={employee.id}
                  className="flex-row justify-around gap-2 px-2 py-2.5 text-center"
                >
                  <Text className="w-[38%] text-sm text-[#333]">
                    {employee.last_name}, {employee.first_name}
                    {["NA", "N/A"].includes(employee.middle_initial.toUpperCase())
                      ? ""
                      : ` ${employee.middle_initial.toUpperCase()}.`}
                  </Text>

                  <Text className="w-[10%] text-sm text-[#333]">
                    {employee.rate}
                  </Text>

                  <Text className="w-1/5 text-sm text-[#333]">
                    {employee.start_day.slice(0, 3)} -{" "}
                    {employee.end_day.slice(0, 3)}
                  </Text>

                  <View className="w-[27%] flex-row justify-around">
                    <TouchableOpacity onPress={() => setEmployee(employee.id)}>
                      <Icon name="remove-red-eye" size={20} color="#2196F3" />
                    </TouchableOpacity>

                    <UpdateEmployeeModal
                      db={db}
                      employee={employee}
                      refetch={refetch}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        confirmAlert("Employee", onDelete, employee.id);
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
        </View>
      </ScrollView>
    </>
  );
};

export default EmployeesTable;
