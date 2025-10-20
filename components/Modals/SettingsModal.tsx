import Select from "@/components/FormikSelect";
import { establishments } from "@/db/schema";
import { establishment as validationSchema } from "@/schemas/globals";
import { Db, Establishment, Override } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq, sql } from "drizzle-orm";
import { Formik } from "formik";
import { useImmer } from "use-immer";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Href, useRouter, Link } from "expo-router";

type Props = {
  db: Db;
  refetch: () => void;
};

const SettingsModal = ({ db, refetch }: Props) => {
  const initialValues = {
    name: "",
    size: "Employing 10 or more workers",
  };

  const [isVisible, setIsVisible] = useImmer(false);

  const handleSubmit = async (
    values: Override<Establishment, { id?: number }>,
    { resetForm }: { resetForm: () => void },
  ) => {
    values = {
      ...values,
      name: values.name.trim(),
    };

    try {
      const record = await db.query.establishments.findFirst({
        where: eq(sql`LOWER(${establishments.name})`, values.name.toLowerCase()),
      });

      if (record) {
        Toast.show({
          type: "error",
          text1: "Establishment Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db.insert(establishments).values(values);
        refetch();
        resetForm();
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
        <Text className="text-center font-bold text-white">
          Settings⚙️
        </Text>
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
            setFieldTouched,
            setFieldValue,
          }) => (
            <View className="flex-1 items-center justify-center bg-black/40">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View>
                    <Link
                      href="/holidaylist"
                      asChild
                    >
                      <TouchableOpacity className="rounded-[0.625rem] bg-black p-3">
                        <Text className="text-center font-bold text-white">
                          Holidays📅
                        </Text>
                      </TouchableOpacity>
                    </Link>
                </View>
                <View>
                  <Link
                      href="/wageorder"
                      asChild>
                  <TouchableOpacity
                    className="rounded-[0.625rem] bg-black  p-3 mt-4"
                    onPress={() => setIsVisible(true)}
                  >
                    <Text className="text-center font-bold text-white">
                      Wage Order📑
                    </Text>
                  </TouchableOpacity>
                  </Link>
                </View>

                <View className="flex-row justify-end">
                  <TouchableOpacity
                    className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                    onPress={() => setIsVisible(false)}
                  >
                    <Text className="font-bold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default SettingsModal;
