import type { ChannelModel } from "amqplib";
import { DIContainer, TOKENS } from "../utils/DependencyInjection.js";
import { injectable } from "inversify";
import { jsonResponse } from "../utils/Response.js";
import { StatusCodes } from "http-status-codes";

@injectable()
export class ProductsService {
  private mqConnection = DIContainer.getAsync<ChannelModel>(TOKENS.MQ);

  async createOrder() {
    const queueKey = 'orders';
    const connection = await this.mqConnection;
    const channel = await connection.createChannel();
    await channel.assertQueue(queueKey, { durable: true });

    const message = JSON.stringify({ hello: "world" });
    channel.sendToQueue(queueKey, Buffer.from(message));

    await channel.close();

    return jsonResponse({
      statusCode: StatusCodes.CREATED,
      message: "Successfully reserved order!",
      data: { some: "ticket_value" }
    });
  }
}
