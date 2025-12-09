import client from "./valkey";

const IP_VISIT_KEY_PREFIX = "visits_ip";
const TOTAL_VISITS_KEY = "portfolio_visits";
const DEBOUNCE_VISIT_TTL_SECONDS = 60 * 15; // 15 minutes

export async function incrementVisits(ip: string): Promise<number> {
  const key = `${IP_VISIT_KEY_PREFIX}:${ip}`;

  const wasSet = await client.set(
    key,
    "1",
    "EX",
    DEBOUNCE_VISIT_TTL_SECONDS,
    "NX"
  );

  if (wasSet) {
    // The key was set, so this is a new visit. Increment the counter.
    return client.incr(TOTAL_VISITS_KEY);
  }

  // The key already existed, so this is a repeat visit within the TTL.
  // Just return the current count.
  return getVisits();
}

export async function getVisits(): Promise<number> {
  const visits = (await client.get(TOTAL_VISITS_KEY)) || "0";
  return parseInt(visits, 10);
}
