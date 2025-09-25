import Loader from "@/components/Loader";
import migrations from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import Toast, {
  BaseToastProps,
  ErrorToast,
  SuccessToast,
} from "react-native-toast-message";
import tw from "twrnc";

const name = "WageCalculator.db";
const expoDb = openDatabaseSync(name, { useNewConnection: true });
const db = drizzle(expoDb);

const toastConfig = {
  success: (props: BaseToastProps) => (
    <SuccessToast {...props} text1Style={tw`text-sm text-center`} />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast {...props} text1Style={tw`text-sm text-center`} />
  ),
};

const RootLayout = () => {
  useMigrations(db, migrations);

  return (
    <>
      <Suspense fallback={<Loader />}>
        <SQLiteProvider
          databaseName={name}
          options={{ useNewConnection: false }}
          useSuspense
        >
          <Stack screenOptions={{ headerShown: false }} />
        </SQLiteProvider>
      </Suspense>

      <Toast config={toastConfig} />
    </>
  );
};

export default RootLayout;
