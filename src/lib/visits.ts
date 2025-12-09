import client from "./valkey";

export async function incrementVisits(ip: string): Promise<number> {
  const key = `visits_ip:${ip}`;
  const ttl = 60 * 15;

  const alreadyVisited = await client.exists(key);
  if (alreadyVisited) {
    const visits = (await client.get("portfolio_visits")) || "0";
    return parseInt(visits, 10);
  }

  await client.set(key, 1, "EX", ttl);

  const visits = await client.incr("portfolio_visits");
  return visits;
}

export async function getVisits(): Promise<number> {
  const visits = (await client.get("portfolio_visits")) || "0";
  return parseInt(visits, 10);
}
