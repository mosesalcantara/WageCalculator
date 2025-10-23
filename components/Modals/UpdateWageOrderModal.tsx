import { wageOrders } from "@/db/schema";
import { wageOrder as validationSchema } from "@/schemas/globals";
import { Db, Override, WageOrder } from "@/types/globals";
import { formatDateValue, toastVisibilityTime } from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq, sql } from "drizzle-orm";
import { Formik } from "formik";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  wageOrder: WageOrder;
  refetch: () => void;
};

const UpdateWageOrderModal = ({ db, wageOrder, refetch }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);
  const [isDateModalVisible, setIsDateModalVisible] = useImmer(false);

  const initialValues = wageOrder;

  const handleSubmit = async (
    values: Override<
      WageOrder,
      {
        less_than_ten: string | number;
        ten_or_more: string | number;
      }
    >,
    { resetForm }: { resetForm: () => void },
  ) => {
    const formattedValues = {
      ...values,
      name: values.name.trim(),
      less_than_ten: Number(values.less_than_ten),
      ten_or_more: Number(values.ten_or_more),
    };

    try {
      const record = await db.query.wageOrders.findFirst({
        where: eq(sql`LOWER(${wageOrders.name})`, formattedValues.name.toLowerCase()),
      });

      const isSame = wageOrder.name.toLowerCase() == formattedValues.name.toLowerCase();

      if (record && !isSame) {
        Toast.show({
          type: "error",
          text1: "Wage Order Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db
          .update(wageOrders)
          .set(formattedValues)
          .where(eq(wageOrders.id, formattedValues.id));
        refetch();
        resetForm();
        setIsVisible(false);
        Toast.show({
          type: "success",
          text1: "Updated Wage Order",
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
        <Icon name="edit" size={20} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleSubmit,
            handleChange,
            setFieldValue,
            setFieldTouched,
          }) => (
            <View className="flex-1 items-center justify-center bg-black/40">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mt-1 font-bold text-white">Name</Text>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter name"
                      editable={false}
                      value={values.name}
                      onChangeText={handleChange("name")}
                      onBlur={() => setFieldTouched("name")}
                    />
                    {touched.name && errors.name && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                        {errors.name}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mb-1 text-base font-bold text-white">
                      Date
                    </Text>
                    <TouchableOpacity
                      className="h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                      onPress={() => setIsDateModalVisible(true)}
                    >
                      <Text>{values.date || "Select date"}</Text>
                      <Icon name="date-range" size={20} color="#555" />
                    </TouchableOpacity>
                    {touched.date && errors.date && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                        {errors.date}
                      </Text>
                    )}
                  </View>
                </View>

                <View>
                  <Text className="mt-1 font-bold text-white">
                    Employing 1 to 9 workers:
                  </Text>
                  <TextInput
                    className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                    keyboardType="numeric"
                    placeholder="Enter rate"
                    value={`${values.less_than_ten}`}
                    onChangeText={handleChange("less_than_ten")}
                    onBlur={() => setFieldTouched("less_than_ten")}
                  />
                  {touched.less_than_ten && errors.less_than_ten && (
                    <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                      {errors.less_than_ten}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="mt-1 font-bold text-white">
                    Employing 10 workers and above:
                  </Text>
                  <TextInput
                    className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                    keyboardType="numeric"
                    placeholder="Enter rate"
                    value={`${values.ten_or_more}`}
                    onChangeText={handleChange("ten_or_more")}
                    onBlur={() => setFieldTouched("ten_or_more")}
                  />
                  {touched.ten_or_more && errors.ten_or_more && (
                    <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                      {errors.ten_or_more}
                    </Text>
                  )}
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
                    onPress={() => handleSubmit()}
                  >
                    <Text className="font-bold">Update</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isDateModalVisible && (
                <DateTimePicker
                  value={formatDateValue(values.date)}
                  mode="date"
                  onChange={(_, value) => {
                    setFieldValue(
                      "date",
                      (value as Date).toISOString().split("T")[0],
                    );
                    setIsDateModalVisible(false);
                  }}
                />
              )}
            </View>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default UpdateWageOrderModal;
