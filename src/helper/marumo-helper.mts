import axios, { HttpStatusCode } from "axios";
import { DateTime } from "luxon";
import { AvailableBooking } from "../models/AvailableBooking.mjs";
import { MonthAvailGroups } from "../models/MonthAvailGroups.mjs";
import { TableSizes } from "../models/TableSizes.mjs";
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
  private discordHelper: DiscordHelper = new DiscordHelper();
  private stop: boolean = false;

  stopPolling(): void {
    this.stop = true;
  }

  async startPolling(pollingRateInMs: number): Promise<void> {
    while (!this.stop) {
      var today = DateTime.now();
      var availableMonths = await this.fetchMonthGroup(today.year, today.month);

      if (availableMonths == undefined) {
        await setTimeout(pollingRateInMs);
        continue;
      }

      var availableBookings = Object.entries(availableMonths)
        .filter(([_, availableMonth]) => {
          return (
            availableMonth.open &&
            !availableMonth.dont_show &&
            !availableMonth.full &&
            Number(availableMonth.capacity) > availableMonth.capacity_in_use
          );
        })
        .map<AvailableBooking>(([date, availableMonth]) => {
          return {
            date: DateTime.fromISO(date),
            tables: Object.entries<number>(availableMonth.size_avail)
              .filter(([_, space]) => space > 0)
              .reduce<TableSizes>((obj, [table, space]) => {
                obj[table] = space;
                return obj;
              }, {}),
          };
        });
      if (availableBookings.length > 0) {
        console.log(`We have ${availableBookings.length} available bookings!`);
        await this.discordHelper.broadcast(
          `Found available Marumo Bookings ${availableBookings}`
        );
      } else {
        console.log("No available bookings found!");
      }
      await setTimeout(pollingRateInMs);
    }
  }

  private async fetchMonthGroup(
    year: number,
    month: number
  ): Promise<MonthAvailGroups | undefined> {
    const response = await axios.post<MonthAvailGroups>(
      "https://obee.com.au/marumo/ajax/ajaxMonthAvailGroup.php",
      {
        year: year,
        month: month,
        size_limit: 6,
      },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
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
      }
    );

    if (response.status != HttpStatusCode.Ok) {
      console.log(
        `Response from Marumo contains unexpected status: ${response.status} - ${response.statusText}`
      );
      return undefined;
    }

    return response.data;
  }
}
