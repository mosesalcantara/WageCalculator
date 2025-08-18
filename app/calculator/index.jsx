import Calculator from "@/components/Calculator/Calculator";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/db/schema";

const CalculatorPage = () => {
  const initialDb = useSQLiteContext();
  const db = drizzle(initialDb, { schema });

  return <Calculator db={db} />;
};

export default CalculatorPage;
