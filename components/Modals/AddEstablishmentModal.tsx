import ErrorMessage from "@/components/ErrorMessage";
import Label from "@/components/Label";
import Select from "@/components/Select";
import { establishments } from "@/db/schema";
import {
  establishment as schema,
  Establishment as Values,
} from "@/schemas/globals";
import { Db } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { MaterialIcons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { eq, sql } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  refetch: () => void;
};

const AddEstablishmentModal = ({ db, refetch }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    const formattedValues = {
      ...values,
      name: values.name.trim(),
    };

    try {
      const record = await db.query.establishments.findFirst({
        where: eq(
          sql`LOWER(${establishments.name})`,
          formattedValues.name.toLowerCase(),
        ),
      });

      if (record) {
        Toast.show({
          type: "error",
          text1: "Establishment Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db.insert(establishments).values(formattedValues);
        refetch();
        reset();
        setIsVisible(false);
        Toast.show({
          type: "success",
          text1: "Added Establishment",
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
      <TouchableOpacity
        className="rounded-[1.875rem] bg-black p-3"
        onPress={() => setIsVisible(true)}
      >
        <MaterialIcons name="add" size={20} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="w-4/5 gap-2 rounded-[0.625rem] bg-[#1E90FF] p-4">
            <View>
              <Label name="Name" />

              <Controller
                control={control}
                name="name"
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
              <Label name="Size" />

              <Controller
                control={control}
                name="size"
                defaultValue="Employing 10 or more workers"
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
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-b">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="font-b">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AddEstablishmentModal;
