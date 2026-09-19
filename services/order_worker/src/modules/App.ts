import { MqService } from "./services/MqService.js";
import { WorkerService } from "./services/WorkerService.js";
import { DIContainer, TOKENS } from "./utils/DependencyInjection.js";

export class App {
  constructor() {
    this.bootstrap();
  }

  async start() {
    const worker = DIContainer.get(WorkerService);
    await worker.start();
  }

  private bootstrap() {
    DIContainer.bind(TOKENS.MQ).toResolvedValue(MqService.resolveValue);
    DIContainer.bind(WorkerService).toSelf().inSingletonScope();
  }
}
