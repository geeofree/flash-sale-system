import { createClient } from "redis";

export class RedisService {
  static async resolveValue() {
    const redisClient = createClient({ url: process.env['REDIS_URL']! });
    await redisClient.connect();
    return redisClient;
  }
}
