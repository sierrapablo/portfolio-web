import Redis from "ioredis";
import { VALKEY_HOST, VALKEY_PORT, VALKEY_PASSWORD } from "astro:env/server";

const client = new Redis({
  host: VALKEY_HOST,
  port: VALKEY_PORT,
  password: VALKEY_PASSWORD,
  lazyConnect: true,
});

export default client;
