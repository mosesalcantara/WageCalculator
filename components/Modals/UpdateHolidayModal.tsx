import Select from "@/components/Select";
import { holidays } from "@/db/schema";
import { holiday as schema, Holiday as Values } from "@/schemas/globals";
import { Db, Holiday } from "@/types/globals";
import { getDate, toastVisibilityTime } from "@/utils/globals";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  holiday: Holiday;
  refetch: () => void;
};

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
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    const formattedValues = {
      ...values,
      name: values.name.trim(),
      date: getDate(values.date),
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
        <Icon name="edit" size={20} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
            <View>
              <Text className="font-b mt-1 text-white">Name</Text>

              <Controller
                control={control}
                name="name"
                defaultValue={holiday.name}
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </>
                )}
              />

              {errors.name && (
                <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                  {errors.name.message}
                </Text>
              )}
            </View>

            <View>
              <Text className="font-b mb-1 text-base text-white">Date</Text>

              <Controller
                control={control}
                name="date"
                defaultValue={new Date(holiday.date)}
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TouchableOpacity
                      className="h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                      onPress={() => setIsDateModalVisible(true)}
                    >
                      <Text className="font-r">
                        {value ? getDate(value) : "Select date"}
                      </Text>
                      <Icon name="date-range" size={20} color="#555" />
                    </TouchableOpacity>
                  </>
                )}
              />

              {errors.date && (
                <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                  {errors.date.message}
                </Text>
              )}
            </View>

            <View>
              <Text className="font-b mt-1 text-white">Type</Text>

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

              {errors.type && (
                <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                  {errors.type.message}
                </Text>
              )}
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
                <Text className="font-b">Update</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isDateModalVisible && (
            <DateTimePicker
              value={getValues("date") || new Date()}
              mode="date"
              onChange={async (_, value) => {
                if (value) {
                  setValue("date", value);
                  await trigger("date");
                  setIsDateModalVisible(false);
                }
              }}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default UpdateHolidayModal;
