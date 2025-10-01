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
import tw from "twrnc";

type Props = {
  db: Db;
  router: Router;
  records: Employee[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const EmployeesTable = ({ db, router, records, refetch, onDelete }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = useMemo(() => {
    if (records && searchQuery) {
      return records.filter((record) => {
        return Object.values(record).some((value) => {
          return `${value}`.toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    } else {
      return records;
    }
  }, [records, searchQuery]);

  const setEmployee = (id: number) => {
    SessionStorage.setItem("employee_id", `${id}`);
    router.push("/calculator" as Href);
  };

  return (
    <>
      <TextInput
        placeholder="Search employee"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={tw`border border-[#ccc] rounded-lg p-2.5 mb-2.5 text-base`}
      />

      <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
        <View style={tw`bg-white rounded-[0.625rem] overflow-hidden`}>
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

          {filteredRecords && filteredRecords.length > 0 ? (
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
                  {record.start_day.slice(0, 3)} - {record.end_day.slice(0, 3)}
                </Text>

                <View
                  style={tw.style(`flex-row justify-around`, {
                    flex: 1.5,
                  })}
                >
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
            <Text style={tw`text-center my-2.5`}>No employees found.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default EmployeesTable;
