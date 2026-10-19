import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js keeps secrets in .env.local. Prisma's default dotenv load only reads .env.
config({ path: ".env" });
config({ path: ".env.local", override: true });

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
