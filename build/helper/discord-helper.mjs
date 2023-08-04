// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();
export class DiscordHelper {
    token;
    client = new Client({
        intents: [GatewayIntentBits.Guilds],
    });
    #loggedIn = false;
    #ready = false;
    get ready() {
        return this.#ready;
    }
    set ready(ready) {
        this.#ready = ready;
    }
    get loggedIn() {
        return this.#loggedIn;
    }
    set loggedIn(loggedIn) {
        this.#loggedIn = loggedIn;
    }
    constructor(token = process.env.DISCORD_TOKEN ?? "") {
        this.token = token;
    }
    async login() {
        var token = await this.client.login(this.token);
        this.loggedIn = token != "";
        this.client.once(Events.ClientReady, (c) => {
            this.ready = true;
        });
        return token;
    }
    async broadcast(message) {
        this.client.channels.cache
            .filter((ch) => ch.isTextBased())
            .forEach(async (ch) => {
            await ch.send(message);
        });
    }
}
