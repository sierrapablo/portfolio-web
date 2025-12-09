import Redis from "ioredis";

const client = new Redis({
  host: process.env.VALKEY_HOST || "localhost",
  port: Number(process.env.VALKEY_PORT) || 6379,
  password: process.env.VALKEY_PASSWORD,
});

export default client;
