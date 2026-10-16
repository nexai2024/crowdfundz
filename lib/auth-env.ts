const value = process.env.BETTER_AUTH_URL || "http://localhost:3000";

if (!value.startsWith("http://") && !value.startsWith("https://")) {
  process.env.BETTER_AUTH_URL = `http://${value}`;
}
