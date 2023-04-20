import { TableSizes } from "./TableSizes.mjs";

export interface MonthAvailGroup {
  open: boolean;
  dont_show: boolean;
  closed_reason: string;
  capacity: number | string;
  capacity_in_use: number;
  full: boolean;
  tables: string[];
  size_avail: TableSizes;
  specific_table_rule: boolean;
}
