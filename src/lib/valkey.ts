import Redis from "ioredis";
import { VALKEY_HOST, VALKEY_PORT, VALKEY_PASSWORD } from "astro:env/server";

const client = new Redis({
  host: VALKEY_HOST || "localhost",
  port: Number(VALKEY_PORT) || 6379,
  password: VALKEY_PASSWORD,
});

export default client;
