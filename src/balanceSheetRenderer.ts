import {
  ClosedBalanceAccount,
  BalanceItem,
  BalanceItemCategory,
  BalanceStock,
  createItemRef,
  resolveRef,
} from "./balanceSheet";
import formatCurrency from "./util/currencyHelper";
import { verifyAccount } from "./util/tAccountHelper";

const accountantNose: string =
  "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMDAgMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiNjYWNhY2E7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO308L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOTksMC41SDY5Yy0xNy4zMyw4LjMzLTMwLjY3LDE2LjY3LTQ3LDI0Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Im0wLjUgMjQuNWgyMSIvPgo8L3N2Zz4K')";

export function renderBalance(
  title: string,
  accounts: BalanceStock<BalanceItem>[]
): HTMLElement {
  const container = document.createElement("div");
  const active: BalanceStock<BalanceItem>[] = [];
  const passive: BalanceStock<BalanceItem>[] = [];

  accounts.forEach((x) => {
    if (x.value === 0) {
      return;
    }

    if (x.item.category !== "passive") {
      active.push(x);
    } else {
      passive.push(x);
    }
  });

  active.sort((x) => (x.item.category === "fixed-assets" ? 0 : 1));
  passive.sort((x) => (x.item.category === "fixed-assets" ? 0 : 1));

  const element = createBalance(title, active, passive);
  container.append(element);

  return container;
}

function getCategoryName(category: BalanceItemCategory): string | undefined {
  switch (category) {
    case "current-assets":
      return "Umlaufvermögen";
    case "fixed-assets":
      return "Anlagevermögen";
  }

  return undefined;
}

function createBalance(
  accountName: string,
  active: BalanceStock<BalanceItem>[],
  passive: BalanceStock<BalanceItem>[]
): HTMLElement {
  const container = document.createElement("div");
  const table = document.createElement("table");
  const count = Math.max(active.length, passive.length);

  var lastActiveCategory = undefined;
  var activeCategories = 0;
  var activeIndex = 0;
  var passiveIndex = 0;

  while (passiveIndex < count || activeIndex < count) {
    const row = document.createElement("tr");

    if (activeIndex < active.length) {
      if (lastActiveCategory !== active[activeIndex].item.category) {
        lastActiveCategory = active[activeIndex].item.category;

        const category = getCategoryName(
          <BalanceItemCategory>lastActiveCategory
        );

        if (category) {
          row.appendChild(createCategory(category));
          activeCategories++;
        } else {
          populateEntrySide(row, active[activeIndex++], true);
        }
      } else {
        populateEntrySide(row, active[activeIndex++], true);
      }
    } else if (activeIndex == active.length) {
      populateEmptyRow(row, count - activeIndex, true);
      activeIndex = count;
    }

    if (passiveIndex < passive.length) {
      populateEntrySide(row, passive[passiveIndex], false);
    } else if (passiveIndex == passive.length) {
      populateEmptyRow(row, count - passiveIndex + activeCategories, false);
      passiveIndex = count;
    }

    passiveIndex++;

    table.appendChild(row);
  }

  const { activeSum: activeSum, passiveSum: passiveSum } = closeTable(
    table,
    active,
    passive
  );

  container.className = "container w-full d-block";
  container.appendChild(createHeader(accountName));
  container.appendChild(table);

  verifyAccount(
    container,
    activeSum,
    passiveSum,
    active.concat(passive).map((x) => ({ name: x.item.name, balance: x.value }))
  );

  return container;
}

function createCategory(name: string): HTMLElement {
  const column = document.createElement("td");

  column.colSpan = 2;
  column.innerText = name;
  column.className = "category balance-line font-weight-bold";

  return column;
}

const sumItem: BalanceItem = { name: "", category: "fixed-assets", id: "sum" };

function closeTable(
  table: HTMLTableElement,
  left: BalanceStock<BalanceItem>[],
  right: BalanceStock<BalanceItem>[]
): { activeSum: number; passiveSum: number } {
  const reducer = (accumulator: number, currentValue: number) =>
    accumulator + currentValue;

  const row = document.createElement("tr");

  const data = {
    activeSum: left.map((x) => x.value).reduce(reducer, 0),
    passiveSum: right.map((x) => x.value).reduce(reducer, 0),
  };

  populateEntrySide(row, { item: sumItem, value: data.activeSum }, true);
  populateEntrySide(row, { item: sumItem, value: data.passiveSum }, false);

  table.appendChild(row);

  return data;
}

function populateEmptyRow(
  row: HTMLTableRowElement,
  rows: number,
  showSeparator: boolean
) {
  const cell = document.createElement("td");
  const image = document.createElement("div");

  cell.colSpan = 2;
  cell.rowSpan = rows;

  image.style.backgroundImage = accountantNose;
  image.style.width = "100%";
  image.style.height = (30 * rows).toString() + "px";
  image.style.display = "block";

  if (showSeparator) {
    cell.className = "balance-line";
  }

  cell.appendChild(image);
  row.appendChild(cell);
}

function populateEntrySide(
  row: HTMLTableRowElement,
  info: BalanceStock<BalanceItem>,
  showSeparator: boolean
) {
  const ordinal = document.createElement("td");
  const value = document.createElement("td");

  value.innerText = formatCurrency(info.value);
  ordinal.innerText = info.item.name;

  row.className = "balance-row";
  value.className = "balance-column text-right";

  if (showSeparator) {
    value.className += " balance-line";
  }

  if (info.item.name === sumItem.name) {
    value.className += " sum-underline";
  }

  row.appendChild(ordinal);
  row.appendChild(value);
}

export function createHeader(account: string): HTMLElement {
  const row = document.createElement("div");
  const left = document.createElement("span");
  const name = document.createElement("span");
  const right = document.createElement("span");

  left.innerText = "AKTIVA";
  right.innerText = "PASSIVA";
  name.innerText = account;

  row.className = "d-flex flex-row w-full align-items-center";
  left.className = "p-5 text-left font-weight-bold";
  name.className = "font-weight-bolder flex-grow-1 text-center";
  right.className = "font-weight-bold";

  row.appendChild(left);
  row.appendChild(name);
  row.appendChild(right);

  return row;
}
