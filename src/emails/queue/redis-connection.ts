import { env } from "@/env";
import IORedis from "ioredis";

let redis: IORedis | undefined;

export const getConnection = () => {
  redis ??= new IORedis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  });

  return redis;
};
