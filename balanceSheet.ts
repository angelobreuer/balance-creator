export interface BalanceSheet {
  entries: BalanceSheetEntry[];
  stocks: BalanceStock[];
}

export interface BalanceStock {
  item: BalanceItem;
  value: number;
}

export interface BalanceSheetEntry {
  description?: string;
  ignore?: boolean;
  debit: BalanceStock[];
  credit: BalanceStock[];
}

export interface BalanceAccount {
  item: BalanceItem;
  entries: { [key: string]: BalanceStock };
  closingBalance: BalanceStock;
}

export interface BalanceItem {
  name: string;
  category: BalanceItemCategory;
}

export type BalanceItemCategory = "fixed-assets" | "current-assets" | "passive";

export function createAccounts(sheet: BalanceSheet): BalanceAccount[] {
  const accounts: {
    [itemName: string]: {
      item: BalanceItem;
      entries: { [key: string]: BalanceStock };
    };
  } = {};

  // start with adding the stocks to the accounts
  sheet.stocks.forEach((stock) => {
    accounts[stock.item.name] = {
      entries: { AB: stock },
      item: stock.item,
    };
  });

  // add entries
  sheet.entries.forEach((x, index) => {
    if (x.ignore) {
      return;
    }

    const entryName = index + 1 + ")";

    x.debit.concat(x.credit).forEach((x) => {
      if (!accounts[x.item.name]) {
        accounts[x.item.name] = {
          item: x.item,
          entries: { AB: { item: x.item, value: 0 } },
        };
      }

      accounts[x.item.name].entries[entryName] = {
        item: { ...x.item },
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

    return { closingBalance, ...x };
  });
}
