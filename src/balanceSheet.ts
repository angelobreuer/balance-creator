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

function computeSide(
  category: BalanceItemCategory,
  debit: boolean
): BalanceItemCategory {
  const isActiveAccount = category !== "passive";

  if (isActiveAccount === debit) {
    // book on the same account
    return category;
  }

  return isActiveAccount ? "passive" : "fixed-assets";
}

function buildEntryName(
  item: BalanceItem,
  index: number,
  debit: boolean,
  entry: BalanceSheetEntry
) {
  const duplicate =
    entry.debit.some((x) => x.item.id === item.id) &&
    entry.credit.some((x) => x.item.id === item.id);

  if (duplicate) {
    if (debit) {
      return `${index + 1}) (Im Soll)`;
    } else {
      return `${index + 1}) (Im Haben)`;
    }
  }

  return `${index + 1})`;
}

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
  sheet.entries.forEach((entry, index) => {
    if (entry.ignore) {
      return;
    }

    entry.debit.forEach((stock) => {
      const item = resolveRef(stock.item);

      if (!accounts[item.name]) {
        accounts[item.name] = {
          item: resolveRef(stock.item),
          entries: { AB: { item, value: 0 } },
        };
      }

      const name = buildEntryName(item, index, true, entry);
      const category = computeSide(item.category, true);
      const polyItem = { id: name, name, category };

      accounts[item.name].entries[name] = {
        item: polyItem,
        value: stock.value,
      };
    });

    entry.credit.forEach((stock) => {
      const item = resolveRef(stock.item);

      if (!accounts[item.name]) {
        accounts[item.name] = {
          item: resolveRef(stock.item),
          entries: { AB: { item, value: 0 } },
        };
      }

      const name = buildEntryName(item, index, false, entry);
      const category = computeSide(item.category, false);
      const polyItem = { id: name, name, category };

      accounts[item.name].entries[name] = {
        item: polyItem,
        value: stock.value,
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

    var category: BalanceItemCategory;
    if (left > right) {
      // book CBA on credit
      category = "passive";
    } else if (left == right) {
      // book on opposite side
      const isCredit = x.entries["AB"].item.category === "passive";
      category = isCredit ? "fixed-assets" : "passive";
    } else {
      // book CBA on debit
      category = "fixed-assets";
    }

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
