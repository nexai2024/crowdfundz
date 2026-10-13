import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mts",
  },
  datasource: {
    // Supabase migrations need the direct connection. Runtime queries can keep using the pooler URL.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
