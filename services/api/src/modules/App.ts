import { ApiService } from "./services/ApiService.js";
import { DbService } from "./services/DbService.js";
import { MqService } from "./services/MqService.js";
import { ProductsService } from "./services/ProductsService.js";
import { RedisService } from "./services/RedisService.js";
import { SalesService } from "./services/SalesService.js";
import { DIContainer, TOKENS } from "./utils/DependencyInjection.js";

export class App {
  constructor() {
    this.bootstrap();
  }

  start() {
    const apiServer = DIContainer.get(ApiService);
    apiServer.start();
  }

  private bootstrap() {
    DIContainer.bind(TOKENS.DB).toConstantValue(DbService.resolveValue());
    DIContainer.bind(TOKENS.REDIS).toConstantValue(RedisService.resolveValue());
    DIContainer.bind(TOKENS.MQ).toResolvedValue(MqService.resolveValue);

    DIContainer.bind(ApiService).toSelf().inSingletonScope();
    DIContainer.bind(SalesService).toSelf().inSingletonScope();
    DIContainer.bind(ProductsService).toSelf().inSingletonScope();
  }
}
