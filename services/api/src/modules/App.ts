import { ApiService } from "./services/ApiService.js";
import { DbService } from "./services/DbService.js";
import { RedisService } from "./services/RedisService.js";
import { SalesService } from "./services/SalesService.js";
import { DIContainer } from "./utils/DependencyInjection.js";

export class App {
  constructor() {
    DIContainer.bind(DbService).toConstantValue(DbService.getDbClient());
    DIContainer.bind(RedisService).toConstantValue(RedisService.getRedisClient());
    DIContainer.bind(ApiService).to(ApiService).inSingletonScope();

    DIContainer.bind(SalesService).toSelf().inSingletonScope();
  }

  start() {
    const apiServer = DIContainer.get(ApiService);
    apiServer.start();
  }
}
