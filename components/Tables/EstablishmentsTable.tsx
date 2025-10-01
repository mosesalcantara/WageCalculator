import { Db, Establishment } from "@/types/globals";
import { Href, Router } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";
import confirmAlert from "@/components/ConfirmAlert";
import UpdateEstablishmentModal from "@/components/Modals/UpdateEstablishmentModal";

type Props = {
  db: Db;
  router: Router;
  records: Establishment[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const EstablishmentsTable = ({
  db,
  router,
  records,
  refetch,
  onDelete,
}: Props) => {
  const setEstablishment = (id: number, route: string) => {
    SessionStorage.setItem("establishment_id", `${id}`);
    router.push(`/${route}` as Href);
  };

  return (
    <FlatList
      data={records}
      keyExtractor={(record) => `${record.id}`}
      renderItem={({ item: record }) => (
        <View
          style={tw`flex-row justify-between bg-white p-2.5 my-1.5 border rounded-md`}
        >
          <Text style={tw`font-bold`}>{record.name}</Text>

          <View style={tw`flex-row gap-1`}>
            <TouchableOpacity
              onPress={() => setEstablishment(record.id, "employees")}
            >
              <Icon name="remove-red-eye" size={20} color="#2196F3" />
            </TouchableOpacity>

            <UpdateEstablishmentModal
              db={db}
              values={record}
              refetch={refetch}
            />

            <TouchableOpacity
              onPress={() => confirmAlert("Establishment", onDelete, record.id)}
            >
              <Icon name="delete" size={20} color="#E53935" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEstablishment(record.id, "pdf")}
            >
              <Icon name="file-download" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

export default EstablishmentsTable;
