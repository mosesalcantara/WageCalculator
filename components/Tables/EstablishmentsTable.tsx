import confirmAlert from "@/components/ConfirmAlert";
import UpdateEstablishmentModal from "@/components/Modals/UpdateEstablishmentModal";
import { Db, Establishment } from "@/types/globals";
import { Href, Router } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import SessionStorage from "react-native-session-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  db: Db;
  router: Router;
  establishments: Establishment[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const EstablishmentsTable = ({
  db,
  router,
  establishments,
  refetch,
  onDelete,
}: Props) => {
  const setEstablishment = (id: number, route: string) => {
    SessionStorage.setItem("establishment_id", `${id}`);
    router.push(`/${route}` as Href);
  };

  return (
    <View className="h-[88%]">
      <FlatList
        data={establishments}
        keyExtractor={(establishment) => `${establishment.id}`}
        renderItem={({ item: establishment }) => (
          <View className="my-1.5 flex-row justify-between rounded-md border bg-white p-2.5">
            <View className="w-[70%]">
              <Text className="font-b">{establishment.name}</Text>
            </View>

            <View className="w-[30%] flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setEstablishment(establishment.id, "employees")}
              >
                <Icon name="remove-red-eye" size={20} color="#2196F3" />
              </TouchableOpacity>

              <UpdateEstablishmentModal
                db={db}
                establishment={establishment}
                refetch={refetch}
              />

              <TouchableOpacity
                onPress={() =>
                  confirmAlert(establishment.id, "Establishment", onDelete)
                }
              >
                <Icon name="delete" size={20} color="#E53935" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEstablishment(establishment.id, "export")}
              >
                <Icon name="file-download" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default EstablishmentsTable;
