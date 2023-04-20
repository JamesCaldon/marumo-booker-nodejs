// Require the necessary discord.js classes
import {
  Client,
  Events,
  GatewayIntentBits,
  TextBasedChannel,
} from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

export class DiscordHelper {
  public readonly client: Client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  #loggedIn = false;
  #ready = false;

  public get ready(): boolean {
    return this.#ready;
  }

  private set ready(ready: boolean) {
    this.#ready = ready;
  }

  public get loggedIn(): boolean {
    return this.#loggedIn;
  }

  private set loggedIn(loggedIn: boolean) {
    this.#loggedIn = loggedIn;
  }

  constructor(private token: string = process.env.DISCORD_TOKEN ?? "") {}

  async login(): Promise<string> {
    var token = await this.client.login(this.token);
    this.loggedIn = token != "";
    this.client.once(Events.ClientReady, (c) => {
      this.ready = true;
    });
    return token;
  }

  async broadcast(message: string) {
    this.client.channels.cache
      .filter((ch): ch is TextBasedChannel => ch.isTextBased())
      .forEach(async (ch) => {
        await ch.send(message);
      });
  }
}
