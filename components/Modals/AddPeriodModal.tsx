import { period as schema, Period as Values } from "@/schemas/globals";
import { getDate } from "@/utils/globals";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  onSubmit: (values: Values) => Promise<void>;
};

const AddPeriodModal = ({ onSubmit }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useImmer(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useImmer(false);

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

  return (
    <>
      <TouchableOpacity
        className="rounded-[1.875rem] bg-black p-3"
        onPress={() => setIsVisible(true)}
      >
        <Text className="text-center font-bold text-white">Add Period</Text>
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
            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Text className="mb-1 text-base font-bold text-white">
                  Start Date
                </Text>

                <Controller
                  control={control}
                  name="start_date"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TouchableOpacity
                        className="h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                        onPress={() => setIsStartDateModalVisible(true)}
                      >
                        <Text>{value ? getDate(value) : "Select date"}</Text>
                        <Icon name="date-range" size={20} color="#555" />
                      </TouchableOpacity>
                    </>
                  )}
                />

                {errors.start_date && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.start_date.message}
                  </Text>
                )}
              </View>

              <View className="w-[49%]">
                <Text className="mb-1 text-base font-bold text-white">
                  End Date
                </Text>

                <Controller
                  control={control}
                  name="end_date"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TouchableOpacity
                        className="h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                        onPress={() => setIsEndDateModalVisible(true)}
                      >
                        <Text>{value ? getDate(value) : "Select date"}</Text>
                        <Icon name="date-range" size={20} color="#555" />
                      </TouchableOpacity>
                    </>
                  )}
                />

                {errors.end_date && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.end_date.message}
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="font-bold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isStartDateModalVisible && (
            <DateTimePicker
              value={getValues("start_date") || new Date()}
              mode="date"
              onChange={(_, value) => {
                if (value) {
                  setValue("start_date", value);
                  trigger("start_date");
                  setIsStartDateModalVisible(false);
                }
              }}
            />
          )}

          {isEndDateModalVisible && (
            <DateTimePicker
              value={getValues("end_date") || new Date()}
              mode="date"
              onChange={async (_, value) => {
                if (value) {
                  setValue("end_date", value);
                  await trigger("end_date");
                  setIsEndDateModalVisible(false);
                }
              }}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default AddPeriodModal;
