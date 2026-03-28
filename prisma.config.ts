import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  // DIRECT_URL (port 5432) used for migrations only — not runtime
  // DATABASE_URL (port 6543 pooler) used at runtime via lib/prisma.ts
  datasource: { url: process.env.DIRECT_URL ?? "postgresql://localhost/placeholder" },
});
