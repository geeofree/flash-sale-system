import { Redis } from "ioredis";

export class RedisService {
  static resolveValue() {
    const host = process.env['REDIS_HOST'] || '127.0.0.1'
    const port = process.env['REDIS_PORT'] ? Number(process.env['REDIS_PORT']) : 6379
    const redisClient = new Redis({ host, port });
    return redisClient;
  }
}
