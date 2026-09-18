import type { Container as DIContainerType } from "inversify";
import { Container } from "inversify";

export const DIContainer: DIContainerType = new Container();

export const TOKENS = {
  DB: Symbol.for('DB'),
  REDIS: Symbol.for('REDIS'),
  MQ: Symbol.for('MQ'),
}
