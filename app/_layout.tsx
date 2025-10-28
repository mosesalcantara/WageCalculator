import Loader from "@/components/Loader";
import migrations from "@/drizzle/migrations";
import "@/globals.css";
import { Montserrat_400Regular, useFonts } from "@expo-google-fonts/montserrat";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import Toast, {
  BaseToastProps,
  ErrorToast,
  SuccessToast,
} from "react-native-toast-message";

const name = "WageCalculator.db";
const expoDb = openDatabaseSync(name, { useNewConnection: true });
const db = drizzle(expoDb);

const toastConfig = {
  success: (props: BaseToastProps) => (
    <SuccessToast
      {...props}
      text1Style={{
        fontSize: 14,
        textAlign: "center",
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 14,
        textAlign: "center",
      }}
    />
  ),
};

const RootLayout = () => {
  useMigrations(db, migrations);

  const [loaded, error] = useFonts({
    Montserrat_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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
