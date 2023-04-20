// Require the necessary discord.js classes
import { Client, GatewayIntentBits, TextBasedChannel } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

export class DiscordHelper {
  public readonly client: Client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  constructor(private token: string = process.env.DISCORD_TOKEN ?? "") {}

  async login(): Promise<string> {
    return await this.client.login(this.token);
  }

  async broadcast(message: string) {
    this.client.channels.cache
      .filter((ch): ch is TextBasedChannel => ch.isTextBased())
      .forEach(async (ch) => {
        await ch.send(message);
      });
  }
}
