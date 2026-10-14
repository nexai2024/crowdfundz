import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { dash } from "@better-auth/infra";
import { isAllowedAppOrigin } from "./hosts";
import { prisma } from "./prisma";

const allowedHosts = [
  "localhost",
  "localhost:*",
  "*.localhost",
  "*.localhost:*",
  "127.0.0.1",
  "127.0.0.1:*",
  "crowdventure.quest",
  "*.crowdventure.quest",
  "venturesolo.quest",
  "*.venturesolo.quest",
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: {
    allowedHosts,
    fallback: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    protocol: "auto",
  },
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return [
      "http://localhost:*",
      "http://127.0.0.1:*",
      "http://*.localhost:*",
      "https://crowdventure.quest",
      "https://*.crowdventure.quest",
      "https://venturesolo.quest",
      "https://*.venturesolo.quest",
      origin && isAllowedAppOrigin(origin) ? origin : null,
    ];
  },
  emailAndPassword: { enabled: true },
  plugins: [
    dash()
  ]
});

  