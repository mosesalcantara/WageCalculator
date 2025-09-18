import Loader from "@/components/Loader";
import migrations from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import Toast, { ErrorToast, SuccessToast } from "react-native-toast-message";

const name = "WageCalculator.db";
const expoDb = openDatabaseSync(name, { useNewConnection: true });
const db = drizzle(expoDb);

const toastConfig = {
  success: (props) => (
    <SuccessToast
      {...props}
      style={{ width: "55%", borderLeftColor: "lightgreen", paddingRight: 10 }}
      text1Style={{
        fontSize: 14,
        textAlign: "center",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ width: "83%", borderLeftColor: "red", paddingRight: 10 }}
      text1Style={{
        fontSize: 14,
        textAlign: "center",
      }}
    />
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
