import Loader from "@/components/Loader";
import migrations from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";

const name = "WageCalculator.db";
const expoDb = openDatabaseSync(name);
const db = drizzle(expoDb);

const RootLayout = () => {
  const { success, error } = useMigrations(db, migrations);

  return (
    <Suspense fallback={<Loader />}>
      <SQLiteProvider
        databaseName={name}
        options={{ useNewConnection: false }}
        useSuspense
      >
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
};

export default RootLayout;
