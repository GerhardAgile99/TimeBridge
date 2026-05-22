import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  PORT: parseInt(optional("PORT", "4000"), 10),
  NODE_ENV: optional("NODE_ENV", "development"),
  DATABASE_URL: optional(
    "DATABASE_URL",
    "postgresql://flowtrack:flowtrack_dev@localhost:5432/flowtrack"
  ),
  REDIS_URL: optional("REDIS_URL", "redis://localhost:6379"),
  JWT_SECRET: optional("JWT_SECRET", "dev_secret_change_in_production"),
  ANTHROPIC_API_KEY: process.env["ANTHROPIC_API_KEY"] ?? "",
  SLACK_SIGNING_SECRET: process.env["SLACK_SIGNING_SECRET"] ?? "",
  GITHUB_WEBHOOK_SECRET: process.env["GITHUB_WEBHOOK_SECRET"] ?? "",
} as const;
