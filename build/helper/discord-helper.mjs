var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();
export class DiscordHelper {
    constructor(token) {
        var _a;
        if (token === void 0) { token = (_a = process.env.DISCORD_TOKEN) !== null && _a !== void 0 ? _a : ""; }
        this.token = token;
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds],
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.login(this.token);
        });
    }
    broadcast(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.channels.cache
                .filter((ch) => ch.isTextBased())
                .forEach((ch) => __awaiter(this, void 0, void 0, function* () {
                yield ch.send(message);
            }));
        });
    }
}
