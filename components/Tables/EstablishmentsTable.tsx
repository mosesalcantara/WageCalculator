import confirmAlert from "@/components/ConfirmAlert";
import UpdateEstablishmentModal from "@/components/Modals/UpdateEstablishmentModal";
import { Db, Establishment } from "@/types/globals";
import { MaterialIcons } from "@expo/vector-icons";
import { RelativePathString, Router } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import ViewCustomConfirmation from "../Modals/ViewCustomConfirmation";

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
    router.navigate({
      pathname: `/${route}/[id]` as RelativePathString,
      params: { id },
    });
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
                <MaterialIcons
                  name="remove-red-eye"
                  size={20}
                  color="#2196F3"
                />
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
                <MaterialIcons name="delete" size={20} color="#E53935" />
              </TouchableOpacity>

              <ViewCustomConfirmation
                establishment={establishment}
                refetch={refetch}
                router={router}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default EstablishmentsTable;
