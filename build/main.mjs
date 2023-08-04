import { BookingBot } from "./helper/bot-helper.mjs";
// var marumoHelper = new MarumoHelper();
// await marumoHelper.startPolling(5000);
const botMan = new BookingBot();
botMan.initialiseSite();
