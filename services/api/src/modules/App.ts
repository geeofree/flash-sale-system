import { ApiService } from "./services/ApiService.js";
import { RedisService } from "./services/RedisService.js";
import { DIContainer } from "./utils/DependencyInjection.js";

export class App {
  constructor() {
    DIContainer.bind(RedisService).toConstantValue(RedisService.getRedisClient());
    DIContainer.bind(ApiService).to(ApiService).inSingletonScope();
  }

  start() {
    const apiServer = DIContainer.get(ApiService);
    apiServer.start();
  }
}
