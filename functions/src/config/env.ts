export function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? "CHANGE_ME_DEV_SECRET";
}

export function getAllowedOrigins(): string[] {
  const rawValue = process.env.ALLOWED_ORIGIN ?? "https://api-xbmg4jcj7q-uc.a.run.app";
  return String(rawValue)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}
