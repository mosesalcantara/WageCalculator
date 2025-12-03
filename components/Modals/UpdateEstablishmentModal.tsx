import ErrorMessage from "@/components/ErrorMessage";
import Select from "@/components/Select";
import { establishments } from "@/db/schema";
import {
  establishment as schema,
  Establishment as Values,
} from "@/schemas/globals";
import { Db, Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { MaterialIcons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { eq, sql } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

type Props = { db: Db; establishment: Establishment; refetch: () => void };

const UpdateEstablishmentModal = ({ db, establishment, refetch }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values: Values) => {
    const formattedValues = { ...values, name: values.name.trim() };

    try {
      const record = await db.query.establishments.findFirst({
        where: eq(
          sql`LOWER(${establishments.name})`,
          formattedValues.name.toLowerCase(),
        ),
      });

      const isSame =
        establishment.name.toLowerCase() === formattedValues.name.toLowerCase();

      if (record && !isSame) {
        Toast.show({
          type: "error",
          text1: "Establishment Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db
          .update(establishments)
          .set(formattedValues)
          .where(eq(establishments.id, establishment.id));

        refetch();
        reset();
        setIsVisible(false);

        Toast.show({
          type: "success",
          text1: "Updated Establishment",
          visibilityTime: toastVisibilityTime,
        });
      }
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <MaterialIcons name="edit" size={20} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="mt-[120%] h-[40%] w-full gap-2 rounded-t-xl bg-primary p-4">
            <View>
              <Text className="mb-2 text-left font-b text-lg text-black">
                Name
              </Text>

              <Controller
                control={control}
                name="name"
                defaultValue={establishment.name}
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                      placeholder="Enter name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </>
                )}
              />

              <ErrorMessage error={errors.name} />
            </View>

            <View>
              <Text className="mb-2 text-left font-b text-lg text-black">
                Size
              </Text>

              <Controller
                control={control}
                name="size"
                defaultValue={establishment.size}
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <Select
                      value={value}
                      options={[
                        {
                          label: "Employing 1 to 5 workers",
                          value: "Employing 1 to 5 workers",
                        },
                        {
                          label: "Employing 1 to 9 workers",
                          value: "Employing 1 to 9 workers",
                        },
                        {
                          label: "Employing 10 or more workers",
                          value: "Employing 10 or more workers",
                        },
                      ]}
                      placeholder="Select Size"
                      onChange={onChange}
                      onBlur={onBlur}
                    />
                  </>
                )}
              />

              <ErrorMessage error={errors.size} />
            </View>

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-2 mt-12 rounded bg-white px-4 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-b text-lg">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mr-2 mt-12 rounded bg-white px-4 py-[0.3125rem]"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="font-b text-lg">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UpdateEstablishmentModal;
