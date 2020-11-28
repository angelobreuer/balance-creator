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
  closingBalance?: BalanceStock<BalanceItem>;
  profitAndLoss?: BalanceStock<BalanceItem>;
}

export interface BalanceItem {
  name: string;
  category: BalanceItemCategory;
  id: BalanceItemId;
}

export type BalanceItemCategory =
  | "fixed-assets"
  | "current-assets"
  | "passive"
  | "expense"
  | "income";

function getCounterSide(category: BalanceItemCategory): BalanceItemCategory {
  if (category === "current-assets" || category === "fixed-assets") {
    return "passive";
  } else if (category === "expense") {
    return "income";
  } else if (category === "income") {
    return "expense";
  } else {
    return "current-assets";
  }
}

function computeSide(
  category: BalanceItemCategory,
  debit: boolean
): BalanceItemCategory {
  if (isBookedOnDebit(category) === debit) {
    return category;
  } else {
    return getCounterSide(category);
  }
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

export function isInventoryItem(category: BalanceItemCategory): boolean {
  return category === "income" || category === "expense";
}

interface AccountTableEntry {
  item: BalanceItem;
  entries: { [key: string]: BalanceStock<BalanceItem> };
  debit: number;
  credit: number;
}

type AccountTable = {
  [itemName: string]: AccountTableEntry;
};

function initializeAccounts(accounts: AccountTable) {
  // start with adding the items to the accounts
  storage.items.forEach((item) => {
    if (isInventoryItem(item.category)) {
      accounts[item.name] = { entries: {}, item: item, debit: 0, credit: 0 };
    } else {
      const data = { AB: { item, value: 0 } };
      accounts[item.name] = { entries: data, item: item, debit: 0, credit: 0 };
    }
  });
}

function addStocks(accounts: AccountTable, sheet: BalanceSheet) {
  // start with adding the stocks to the accounts
  sheet.stocks.forEach((stock) => {
    const item = resolveRef(stock.item);

    if (isInventoryItem(item.category)) {
      return;
    }

    const account = accounts[item.name];
    const value = account.entries.AB;
    value.value += stock.value;

    if (value.item.category === "passive") {
      account.credit += value.value;
    } else {
      account.debit += value.value;
    }
  });
}

function bookAccounts(accounts: AccountTable, sheet: BalanceSheet) {
  // add entries
  sheet.entries.forEach((entry, index) => {
    if (entry.ignore) {
      return;
    }

    const entries = entry.debit
      .map((stock) => ({ stock, debit: true }))
      .concat(entry.credit.map((stock) => ({ stock, debit: false })));

    entries.forEach((x) => {
      const item = resolveRef(x.stock.item);
      const name = buildEntryName(item, index, x.debit, entry);
      const category = computeSide(item.category, x.debit);
      const polyItem = { id: name, name, category };
      const account = accounts[item.name];
      console.log(item.name);

      account.entries[name] = {
        item: polyItem,
        value: x.stock.value,
      };

      if (x.debit) {
        account.debit += x.stock.value;
      } else {
        account.credit += x.stock.value;
      }
    });
  });
}

function createClosingBalanceAccount(
  accounts: ClosedBalanceAccount[]
): BalanceAccount {
  const account: BalanceAccount = {
    entries: {},
    item: { category: undefined, id: "CBA", name: "Schlussbilanzkonto" },
  };

  Object.values(accounts).forEach((x) => {
    if (x.closingBalance) {
      account.entries[x.item.name] = {
        item: x.item,
        value: x.closingBalance.value,
      };
    }
  });

  return account;
}

function createProfitAndLossAccount(
  accounts: ClosedBalanceAccount[]
): BalanceAccount | undefined {
  const account: BalanceAccount = {
    entries: {},
    item: { category: undefined, id: "GuV", name: "Gewinn und Verlust" },
  };

  var total = 0;
  var profit = 0;
  var loss = 0;

  Object.values(accounts).forEach((x) => {
    if (x.profitAndLoss) {
      total++;

      account.entries[x.item.name] = {
        item: x.item,
        value: x.profitAndLoss.value,
      };

      if (isBookedOnDebit(x.item.category)) {
        loss += x.profitAndLoss.value;
      } else {
        profit += x.profitAndLoss.value;
      }
    }
  });

  if (total == 0) {
    // no account needed
    return undefined;
  }

  const isProfit = profit > loss;
  const itemName = isProfit ? "Gewinn" : "Verlust";
  const category: BalanceItemCategory = isProfit ? "income" : "expense";

  account.entries[itemName] = {
    item: { category, id: category, name: category },
    value: Math.abs(profit - loss),
  };

  return account;
}

export function closeAccount(item: AccountTableEntry): ClosedBalanceAccount {
  const inventoryItem = isInventoryItem(item.item.category);
  const debitSide = inventoryItem ? "income" : "fixed-assets";
  const creditSide = inventoryItem ? "expense" : "passive";

  const entries: { [key: string]: BalanceStock<BalanceItem> } = {};

  Object.entries(item.entries)
    .filter((x) => x[1].value > 0)
    .map((x) => (entries[x[0]] = x[1]));

  const account: ClosedBalanceAccount = { item: item.item, entries };

  var category: BalanceItemCategory;
  if (item.debit > item.credit) {
    // book CBA on credit
    category = creditSide;
  } else if (item.debit == item.credit) {
    // book on opposite side
    category = item.item.category == creditSide ? debitSide : creditSide;
  } else {
    // book CBA on debit
    category = debitSide;
  }

  const closeAccountName = inventoryItem ? "GuV" : "SBK";

  const closeAccount = {
    item: {
      name: closeAccountName,
      category: category,
      id: closeAccountName.toLowerCase(),
    },
    value: Math.abs(item.credit - item.debit),
  };

  entries[closeAccountName] = closeAccount;
  account[inventoryItem ? "profitAndLoss" : "closingBalance"] = closeAccount;

  return account;
}

function bookProfitsAndLosses(accounts: AccountTable) {
  var account = accounts["Eigenkapital"];

  if (!account) {
    account = accounts["Eigenkapital"] = {
      credit: 0,
      debit: 0,
      entries: {},
      item: { category: "passive", id: "equity", name: "Eigenkapital" },
    };
  }

  var profit = 0;
  var loss = 0;

  Object.values(accounts).forEach((x) => {
    if (isInventoryItem(x.item.category)) {
      profit += x.credit;
      loss += x.debit;
    }
  });

  if (profit == loss) {
    // no booking required
    return;
  }

  if (profit > loss) {
    account.entries["Gewinn"] = {
      item: { category: "fixed-assets", id: "income", name: "Gewinn" },
      value: profit - loss,
    };

    account.credit += loss - profit;
  } else {
    account.entries["Verlust"] = {
      item: { category: "passive", id: "expense", name: "Verlust" },
      value: loss - profit,
    };

    account.debit += loss - profit;
  }
}

export function isBookedOnCredit(category: BalanceItemCategory) {
  return !isBookedOnDebit(category);
}

export function isBookedOnDebit(category: BalanceItemCategory) {
  return (
    category === "current-assets" ||
    category === "fixed-assets" ||
    category === "income"
  );
}

export function createAccounts(sheet: BalanceSheet): BalanceAccount[] {
  const table: AccountTable = {};
  initializeAccounts(table);
  addStocks(table, sheet);
  bookAccounts(table, sheet);
  bookProfitsAndLosses(table);

  // close accounts
  const accounts: BalanceAccount[] = Object.values(table).map(closeAccount);
  const profitAndLossAccount = createProfitAndLossAccount(accounts);

  if (profitAndLossAccount) {
    accounts.push(profitAndLossAccount);
  }

  const closingBalanceAccount = createClosingBalanceAccount(accounts);
  accounts.push(closingBalanceAccount);

  return accounts;
}

export function resolveRef(ref: BalanceItemRef): BalanceItem | undefined {
  return storage.items.find((x) => x.id === ref.id);
}

export function createItemRef(item: BalanceItem): BalanceItemRef {
  return { id: item.id };
}
