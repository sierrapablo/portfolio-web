import client from "./valkey";

export async function incrementVisits(): Promise<number> {
  const visits = await client.incr("portfolio_visits");
  return visits;
}

export async function getVisits(): Promise<number> {
  const visits = await client.get("portfolio_visits") || "0";
  return parseInt(visits, 10);
}
