import { BalanceItem, BalanceSheet } from "./balanceSheet";

export interface Storage {
  items: BalanceItem[];
  sheet: BalanceSheet;
}

export var storage: Storage = { items: [], sheet: { entries: [], stocks: [] } };
