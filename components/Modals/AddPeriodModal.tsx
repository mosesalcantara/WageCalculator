import ErrorMessage from "@/components/ErrorMessage";
import { Period as Values } from "@/schemas/globals";
import { formatDate } from "@/utils/globals";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller, UseFormReturn } from "react-hook-form";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useImmer } from "use-immer";

type Props = {
  form: UseFormReturn<Values, unknown, Values>;
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
  onSubmit: (values: Values) => Promise<void>;
};

const AddPeriodModal = ({ form, isVisible, onToggle, onSubmit }: Props) => {
  const [modalVisibility, setModalVisibility] = useImmer({
    startDate: false,
    endDate: false,
  });

  const {
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <>
      <TouchableOpacity
        className="rounded bg-[#102a47] p-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={() => onToggle(true)}
      >
        <Text className="text-center font-b text-white">Add Period</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => onToggle(false)}
      >
        <TouchableOpacity
          className="flex-2 mt-[0%] h-[158%]"
          onPress={() => onToggle(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/40">
            <TouchableOpacity onPress={() => {}}>
              <View className="w-5/5 rt-[0.625rem] gap-2 rounded-t-xl bg-primary p-4">
                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-full">
                    <Text className="mb-2 mt-2 text-left font-b text-lg text-black">
                      Start Date
                    </Text>

                    <Controller
                      control={control}
                      name="start_date"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <>
                          <TouchableOpacity
                            className="h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                            onPress={() =>
                              setModalVisibility((draft) => {
                                draft.startDate = true;
                              })
                            }
                          >
                            <Text className="font-r">
                              {value ? formatDate(value) : "Select date"}
                            </Text>

                            <MaterialIcons
                              name="date-range"
                              size={20}
                              color="#555"
                            />
                          </TouchableOpacity>
                        </>
                      )}
                    />

                    <ErrorMessage error={errors.start_date} />
                  </View>

                  <View className="w-full">
                    <Text className="mb-2 mt-2 text-left font-b text-lg text-black">
                      End Date
                    </Text>

                    <Controller
                      control={control}
                      name="end_date"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <>
                          <TouchableOpacity
                            className=" h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                            onPress={() =>
                              setModalVisibility((draft) => {
                                draft.endDate = true;
                              })
                            }
                          >
                            <Text className="font-r">
                              {value ? formatDate(value) : "Select date"}
                            </Text>

                            <MaterialIcons
                              name="date-range"
                              size={20}
                              color="#555"
                            />
                          </TouchableOpacity>
                        </>
                      )}
                    />

                    <ErrorMessage error={errors.end_date} />
                  </View>
                </View>

                <View className="mt-6 gap-3">
                  <TouchableOpacity
                    className="rounded border bg-black py-3"
                    onPress={handleSubmit(onSubmit)}
                  >
                    <Text className="text-center text-white font-b text-lg">Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded border bg-white py-3"
                    onPress={() => onToggle(false)}
                  >
                    <Text className="text-center font-b text-lg">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>

            {modalVisibility.startDate && (
              <DateTimePicker
                value={getValues("start_date") || new Date()}
                mode="date"
                onChange={async (event, value) => {
                  if (event.type === "set" && value) {
                    setValue("start_date", value);
                    await trigger("start_date");
                  }
                  setModalVisibility((draft) => {
                    draft.startDate = false;
                  });
                }}
              />
            )}

            {modalVisibility.endDate && (
              <DateTimePicker
                value={getValues("end_date") || new Date()}
                mode="date"
                onChange={async (event, value) => {
                  if (event.type === "set" && value) {
                    setValue("end_date", value);
                    await trigger("end_date");
                  }
                  setModalVisibility((draft) => {
                    draft.endDate = false;
                  });
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default AddPeriodModal;
