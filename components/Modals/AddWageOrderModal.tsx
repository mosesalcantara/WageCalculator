import ErrorMessage from "@/components/ErrorMessage";
import Label from "@/components/Label";
import { wageOrders } from "@/db/schema";
import { wageOrder as schema, WageOrder as Values } from "@/schemas/globals";
import { Db } from "@/types/globals";
import { getDate, toastVisibilityTime } from "@/utils/globals";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq, sql } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  name: string;
  refetch: () => void;
};

const AddWageOrderModal = ({ db, name, refetch }: Props) => {
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
      less_than_ten: Number(values.less_than_ten),
      ten_or_more: Number(values.ten_or_more),
    };

    try {
      const record = await db.query.wageOrders.findFirst({
        where: eq(
          sql`LOWER(${wageOrders.name})`,
          formattedValues.name.toLowerCase(),
        ),
      });

      if (record) {
        Toast.show({
          type: "error",
          text1: "Wage Order Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db.insert(wageOrders).values(formattedValues);
        refetch();
        reset();
        setIsVisible(false);
        Toast.show({
          type: "success",
          text1: "Added Wage Order",
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
        <Text className="text-center font-b text-white">Add Wage Order</Text>
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
            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Label name="Name" />

                <Controller
                  control={control}
                  name="name"
                  defaultValue={name}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                        placeholder="Enter name"
                        editable={false}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                <ErrorMessage error={errors.name} />
              </View>

              <View className="w-[49%]">
                <Label name="Date" />

                <Controller
                  control={control}
                  name="date"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TouchableOpacity
                        className="h-[2.83rem] flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
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

                <ErrorMessage error={errors.date} />
              </View>
            </View>

            <View>
              <Label name="Employing 1 to 9 workers" />

              <Controller
                control={control}
                name="less_than_ten"
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                      keyboardType="numeric"
                      placeholder="Enter rate"
                      value={value ? `${value}` : ""}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </>
                )}
              />

              <ErrorMessage error={errors.less_than_ten} />
            </View>

            <View>
              <Label name="Employing 10 workers and above" />

              <Controller
                control={control}
                name="ten_or_more"
                render={({ field: { value, onChange, onBlur } }) => (
                  <>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                      keyboardType="numeric"
                      placeholder="Enter rate"
                      value={value ? `${value}` : ""}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </>
                )}
              />

              <ErrorMessage error={errors.ten_or_more} />
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
                <Text className="font-b">Add</Text>
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

export default AddWageOrderModal;
