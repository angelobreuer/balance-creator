import { storage } from "./storage";

export interface BalanceSheet {
  entries: BalanceSheetEntry[];
  stocks: BalanceStock[];
}

export interface BalanceStock<T = BalanceItemRef> {
  item: T;
  value: number;
}

export type BalanceItemId = "sbk" | string | "sum";

export class BalanceItemRef {
  readonly id: BalanceItemId;
}

export interface BalanceSheetEntry {
  description?: string;
  ignore?: boolean;
  debit: BalanceStock[];
  credit: BalanceStock[];
}

export interface BalanceAccount {
  item: BalanceItem;
  entries: { [key: string]: BalanceStock<BalanceItem> };
}

export interface ClosedBalanceAccount extends BalanceAccount {
  closingBalance: BalanceStock<BalanceItem>;
}

export interface BalanceItem {
  name: string;
  category: BalanceItemCategory;
  id: BalanceItemId;
}

export type BalanceItemCategory = "fixed-assets" | "current-assets" | "passive";

export function createAccounts(sheet: BalanceSheet): ClosedBalanceAccount[] {
  const accounts: { [itemName: string]: BalanceAccount } = {};

  // start with adding the stocks to the accounts
  sheet.stocks.forEach((stock) => {
    const item = resolveRef(stock.item);

    accounts[item.name] = {
      entries: { AB: { item, value: stock.value } },
      item: item,
    };
  });

  // add entries
  sheet.entries.forEach((x, index) => {
    if (x.ignore) {
      return;
    }

    const entryName = index + 1 + ")";

    x.debit.concat(x.credit).forEach((x) => {
      const item = resolveRef(x.item);

      if (!accounts[item.name]) {
        accounts[item.name] = {
          item: resolveRef(x.item),
          entries: { AB: { item, value: 0 } },
        };
      }

      accounts[item.name].entries[entryName] = { item, value: x.value };
    });
  });

  // close the accounts
  return Object.values(accounts).map((x) => {
    // compute highest "side"
    var left = 0;
    var right = 0;

    Object.values(x.entries).forEach((x) => {
      if (x.item.category !== "passive") {
        left += x.value;
      } else {
        right += x.value;
      }
    });

    const difference = Math.abs(left - right);

    const category: BalanceItemCategory =
      left > right ? "passive" : "fixed-assets";

    const closingBalance = (x.entries["SBK"] = {
      item: { name: "SBK", category: category, id: "sbk" },
      value: difference,
    });

    return { closingBalance, item: x.item, entries: x.entries };
  });
}

export function resolveRef(ref: BalanceItemRef): BalanceItem | undefined {
  return storage.items.find((x) => x.id === ref.id);
}

export function createItemRef(item: BalanceItem): BalanceItemRef {
  return { id: item.id };
}
