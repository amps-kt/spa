import { env } from "@/env";
import IORedis from "ioredis";

export const connection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});
