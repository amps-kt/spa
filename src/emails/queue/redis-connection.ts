import { env } from "@/env";
import IORedis from "ioredis";

export const connection = new IORedis({
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});
