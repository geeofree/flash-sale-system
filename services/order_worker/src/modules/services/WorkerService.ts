import { injectable } from "inversify";
import { DIContainer, TOKENS } from "../utils/DependencyInjection.js";
import type { ChannelModel } from "amqplib";

@injectable()
export class WorkerService {
  private mqConnection = DIContainer.getAsync<ChannelModel>(TOKENS.MQ);

  async start() {
    const queueKey = 'orders';
    const connection = await this.mqConnection;
    const channel = await connection.createChannel();
    await channel.assertQueue(queueKey, { durable: true });

    channel.consume(queueKey, msg => {
      if (msg == null) return;
      console.log('geo-consume', JSON.parse(msg.content.toString()));
      channel.ack(msg);
    });

    console.log('Application listening');
  }
}
