import { storage, Storage } from "./storage";

export interface BalanceSheet {
  entries: BalanceSheetEntry[];
  stocks: BalanceStock[];
}

export interface BalanceStock<T = BalanceItemRef> {
  item: T;
  value: number;
}

export class BalanceItemRef {
  readonly ref: string;
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
}

export type BalanceItemCategory = "fixed-assets" | "current-assets" | "passive";

export function createAccounts(sheet: BalanceSheet): ClosedBalanceAccount[] {
  const accounts: { [itemName: string]: BalanceAccount } = {};

  // start with adding the stocks to the accounts
  sheet.stocks.forEach((stock) => {
    accounts[stock.item.ref] = {
      entries: { AB: { item: resolveRef(stock.item), value: stock.value } },
      item: resolveRef(stock.item),
    };
  });

  // add entries
  sheet.entries.forEach((x, index) => {
    if (x.ignore) {
      return;
    }

    const entryName = index + 1 + ")";

    x.debit.concat(x.credit).forEach((x) => {
      if (!accounts[x.item.ref]) {
        accounts[x.item.ref] = {
          item: resolveRef(x.item),
          entries: { AB: { item: resolveRef(x.item), value: 0 } },
        };
      }

      accounts[x.item.ref].entries[entryName] = {
        item: resolveRef(x.item),
        value: x.value,
      };
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
      item: { name: "SBK", category: category },
      value: difference,
    });

    return { closingBalance, item: x.item, entries: x.entries };
  });
}

export function resolveRef(ref: BalanceItemRef): BalanceItem | undefined {
  return storage.items.find((x) => x.name === ref.ref);
}

export function createItemRef(item: BalanceItem): BalanceItemRef {
  return { ref: item.name };
}
