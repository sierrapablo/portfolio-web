import client from "./valkey";

export async function incrementVisits(ip: string): Promise<number> {
  const key = `visits_ip:${ip}`;
  const ttl = 60 * 15;

  const wasSet = await client.set(key, "1", "EX", ttl, "NX");

  if (wasSet) {
    // The key was set, so this is a new visit. Increment the counter.
    return client.incr("portfolio_visits");
  }

  // The key already existed, so this is a repeat visit within the TTL.
  // Just return the current count.
  return getVisits();
}

export async function getVisits(): Promise<number> {
  const visits = (await client.get("portfolio_visits")) || "0";
  return parseInt(visits, 10);
}
