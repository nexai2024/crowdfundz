import "./auth-env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { dash } from "@better-auth/infra";
import { isAllowedAppOrigin } from "./hosts";
import { sendTransactionalEmail } from "./mail";
import { prisma } from "./prisma";

function authBaseUrl() {
  const value = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `http://${value}`;
}

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
    fallback: authBaseUrl(),
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
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Reset your Crowdventure password",
        text: `Use this link to choose a new password. It expires in one hour.\n\n${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Confirm your Crowdventure email",
        text: `Confirm this email so pledge receipts and password resets reach you.\n\n${url}`,
      });
    },
  },
  plugins: [
    dash()
  ]
});

  