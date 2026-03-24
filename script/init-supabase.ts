import * as dotenv from "dotenv";
import { connectDB, ensureSchema } from "../server/db";

dotenv.config({ path: ".env.local" });

async function main() {
  await connectDB();
  await ensureSchema();
  console.log("Supabase schema initialized successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to initialize Supabase schema:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
