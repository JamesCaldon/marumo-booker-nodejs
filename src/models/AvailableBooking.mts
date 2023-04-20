import { DateTime } from "luxon";
import { TableSizes } from "./TableSizes.mjs";
export interface AvailableBooking {
  date: DateTime;
  tables: TableSizes;
}
