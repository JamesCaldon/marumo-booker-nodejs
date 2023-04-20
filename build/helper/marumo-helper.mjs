var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios, { HttpStatusCode } from "axios";
import { DateTime } from "luxon";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { DiscordHelper } from "./discord-helper.mjs";
import { setTimeout } from "timers/promises";
const rl = readline.createInterface({ input, output });
// // When the client is ready, run this code (only once)
// // We use 'c' for the event parameter to keep it separate from the already defined 'client'
// client.once(Events.ClientReady, (c) => {
//     console.log(`Ready! Logged in as ${c.user.tag}`);
//     DiscordHelper.broadcast(c, `Ready! Logged in as ${c.user.tag}`);
//   });
export class MarumoHelper {
    constructor() {
        this.discordHelper = new DiscordHelper();
        this.stop = false;
    }
    stopPolling() {
        this.stop = true;
    }
    startPolling(pollingRateInMs) {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this.stop) {
                var today = DateTime.now();
                var availableMonths = yield this.fetchMonthGroup(today.year, today.month);
                if (availableMonths == undefined) {
                    yield setTimeout(pollingRateInMs);
                    continue;
                }
                var availableBookings = Object.entries(availableMonths)
                    .filter(([_, availableMonth]) => {
                    return (availableMonth.open &&
                        !availableMonth.dont_show &&
                        !availableMonth.full &&
                        Number(availableMonth.capacity) > availableMonth.capacity_in_use);
                })
                    .map(([date, availableMonth]) => {
                    return {
                        date: DateTime.fromISO(date),
                        tables: Object.entries(availableMonth.size_avail)
                            .filter(([_, space]) => space > 0)
                            .reduce((obj, [table, space]) => {
                            obj[table] = space;
                            return obj;
                        }, {}),
                    };
                });
                if (availableBookings.length > 0) {
                    console.log(`We have ${availableBookings.length} available bookings!`);
                    yield this.discordHelper.broadcast(`Found available Marumo Bookings ${availableBookings}`);
                }
                else {
                    console.log("No available bookings found!");
                }
                yield setTimeout(pollingRateInMs);
            }
        });
    }
    fetchMonthGroup(year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios.post("https://obee.com.au/marumo/ajax/ajaxMonthAvailGroup.php", {
                year: year,
                month: month,
                size_limit: 6,
            }, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
                    Accept: "application/json, text/javascript, */*; q=0.01",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    Pragma: "no-cache",
                    "Cache-Control": "no-cache",
                },
            });
            if (response.status != HttpStatusCode.Ok) {
                console.log(`Response from Marumo contains unexpected status: ${response.status} - ${response.statusText}`);
                return undefined;
            }
            return response.data;
        });
    }
}
