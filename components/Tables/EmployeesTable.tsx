import confirmAlert from "@/components/ConfirmAlert";
import UpdateEmployeeModal from "@/components/Modals/UpdateEmployeeModal";
import { Db, Employee, Establishment } from "@/types/globals";
import { formatNumber } from "@/utils/globals";
import { Href, Router } from "expo-router";
import { useMemo } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  router: Router;
  establishment: Establishment;
  employees: Employee[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const EmployeesTable = ({
  db,
  router,
  establishment,
  employees,
  refetch,
  onDelete,
}: Props) => {
  const sortedEmployees = useMemo(() => {
    return employees?.sort((a, b) => {
      return a.last_name < b.last_name ? -1 : a.last_name > b.last_name ? 1 : 0;
    });
  }, [employees]);

  const [searchQuery, setSearchQuery] = useImmer("");

  const filteredEmployees = useMemo(() => {
    const columns = [
      "last_name",
      "first_name",
      "middle_initial",
      "rate",
      "start_day",
      "end_day",
    ];

    if (sortedEmployees && searchQuery) {
      return sortedEmployees.filter((employee) => {
        const isValid = columns.some((column) => {
          const value = employee[column as keyof Employee];
          return value
            ? `${value}`.toLowerCase().includes(searchQuery.toLowerCase())
            : false;
        });
        if (isValid) return employee;
      });
    }

    return sortedEmployees;
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
            <Text className="w-[35%] text-center text-base font-bold text-white">
              Name
            </Text>
            <Text className="w-[13%] text-center text-base font-bold text-white">
              Rate
            </Text>
            <Text className="w-[20%] text-center text-base font-bold text-white">
              Schedule
            </Text>
            <Text className="w-[27%] text-center text-base font-bold text-white">
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
                  <Text className="w-[35%] text-center text-sm text-[#333]">
                    {employee.last_name}, {employee.first_name}
                    {["na", "n/a"].includes(
                      employee.middle_initial.toLowerCase(),
                    )
                      ? ""
                      : ` ${employee.middle_initial}.`}
                  </Text>

                  <Text className="w-[13%] text-center text-sm text-[#333]">
                    {formatNumber(employee.rate)}
                  </Text>

                  <Text className="w-[20%] text-center text-sm text-[#333]">
                    {employee.start_day.slice(0, 3)} -{" "}
                    {employee.end_day.slice(0, 3)}
                  </Text>

                  <View className="w-[27%] flex-row justify-around">
                    <TouchableOpacity onPress={() => setEmployee(employee.id)}>
                      <Icon name="remove-red-eye" size={20} color="#2196F3" />
                    </TouchableOpacity>

                    <UpdateEmployeeModal
                      db={db}
                      establishment={establishment}
                      employee={employee}
                      refetch={refetch}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        confirmAlert(employee.id, "Employee", onDelete);
                      }}
                    >
                      <Icon name="delete" size={20} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text className="my-2.5 text-center">No Employees Found</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default EmployeesTable;
