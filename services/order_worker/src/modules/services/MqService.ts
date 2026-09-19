import { injectable } from "inversify";
import { connect } from "amqplib";

@injectable()
export class MqService {
  static async resolveValue() {
    const channel = await connect(process.env['RABBITMQ_URL'] ?? '');
    return channel;
  }
}
