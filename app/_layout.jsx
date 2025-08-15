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
  useMigrations(db, migrations);

  return (
    <Suspense fallback={<Loader />}>
      <SQLiteProvider
        databaseName={name}
        options={{ useNewConnection: false }}
        useSuspense
      >
        <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
    </Suspense>
  );
};

export default RootLayout;
