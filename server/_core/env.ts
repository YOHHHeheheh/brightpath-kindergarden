// ── Security-critical environment validation ────────────────────────────────
// The app must NEVER boot with missing or weak secrets. Failing loudly here
// prevents silent auth-bypass bugs in production.

function requireEnv(name: string, minLength = 1): string {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    throw new Error(
      `FATAL: Environment variable ${name} must be set and at least ${minLength} characters long.`,
    );
  }
  return value;
}

// JWT_SECRET: ≥ 32 characters enforced. An empty or short key lets anyone forge
// session tokens, including admin tokens, which is a complete auth bypass.
const cookieSecret = requireEnv("JWT_SECRET", 32);

// APP_ID: Required for OAuth flows and session payload.
const appId = requireEnv("VITE_APP_ID");

export const ENV = {
  appId,
  cookieSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
