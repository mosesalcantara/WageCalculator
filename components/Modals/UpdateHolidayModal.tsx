import ErrorMessage from "@/components/ErrorMessage";
import Select from "@/components/Select";
import { holidays } from "@/db/schema";
import { holiday as schema, Holiday as Values } from "@/schemas/globals";
import { Db, Holiday } from "@/types/globals";
import { formatDate, parseDate, toastVisibilityTime } from "@/utils/globals";
import { MaterialIcons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

type Props = { db: Db; holiday: Holiday; refetch: () => void };

const UpdateHolidayModal = ({ db, holiday, refetch }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);
  const [isDateModalVisible, setIsDateModalVisible] = useImmer(false);

  const {
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values: Values) => {
    const formattedValues = {
      ...values,
      name: values.name.trim(),
      date: formatDate(values.date),
    };

    try {
      await db
        .update(holidays)
        .set(formattedValues)
        .where(eq(holidays.id, holiday.id));

      refetch();
      reset();
      setIsVisible(false);

      Toast.show({
        type: "success",
        text1: "Updated Holiday",
        visibilityTime: toastVisibilityTime,
      });
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
        <Pressable
          style={{ flex: 2, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setIsVisible(false)}
        ></Pressable>

        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="mt-[0%] h-[150%] w-full gap-2 rounded-t-xl bg-primary p-4">
            <View>
              <Text className="mb-2 text-left font-b text-lg text-black">
                Name
              </Text>

              <Controller
                control={control}
                name="name"
                defaultValue={holiday.name}
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] border border-[#ccc] bg-white px-2 font-r"
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
                Date
              </Text>

              <Controller
                control={control}
                name="date"
                defaultValue={parseDate(holiday.date)}
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TouchableOpacity
                      className="h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                      onPress={() => setIsDateModalVisible(true)}
                    >
                      <Text className="font-r">
                        {value ? formatDate(value) : "Select date"}
                      </Text>

                      <MaterialIcons name="date-range" size={20} color="#555" />
                    </TouchableOpacity>
                  </>
                )}
              />

              <ErrorMessage error={errors.date} />
            </View>

            <View>
              <Text className="mb-2 text-left font-b text-lg text-black">
                Type
              </Text>

              <Controller
                control={control}
                name="type"
                defaultValue={holiday.type}
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <Select
                      value={value}
                      options={[
                        {
                          label: "Regular Holiday",
                          value: "Regular Holiday",
                        },
                        {
                          label: "Special (Non-Working) Holiday",
                          value: "Special (Non-Working) Holiday",
                        },
                      ]}
                      placeholder="Select Type"
                      onChange={onChange}
                      onBlur={onBlur}
                    />
                  </>
                )}
              />

              <ErrorMessage error={errors.type} />
            </View>

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-b text-lg">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="font-b text-lg">Update</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isDateModalVisible && (
            <DateTimePicker
              value={getValues("date") || new Date()}
              mode="date"
              onChange={async (event, value) => {
                if (event.type === "set" && value) {
                  setValue("date", value);
                  await trigger("date");
                }
                setIsDateModalVisible(false);
              }}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default UpdateHolidayModal;
