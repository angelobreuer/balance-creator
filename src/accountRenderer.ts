import NameBalancePair from "./balancePair";
import { verifyAccount } from "./util/tAccountHelper";
import {
  BalanceItem,
  BalanceAccount,
  isBookedOnDebit,
  isBookedOnCredit,
} from "./balanceSheet";

const accountantNose: string =
  "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMDAgMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiNjYWNhY2E7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO308L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOTksMC41SDY5Yy0xNy4zMyw4LjMzLTMwLjY3LDE2LjY3LTQ3LDI0Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Im0wLjUgMjQuNWgyMSIvPgo8L3N2Zz4K')";

export function renderAccounts(accounts: BalanceAccount[]): HTMLElement {
  const container = document.createElement("div");

  accounts.forEach((x) => {
    const entries = Object.entries(x.entries);

    const left: NameBalancePair[] = entries
      .filter((x) => isBookedOnDebit(x[1].item.category))
      .map((x) => ({ name: x[0], balance: x[1].value }));

    const right: NameBalancePair[] = entries
      .filter((x) => isBookedOnCredit(x[1].item.category))
      .map((x) => ({ name: x[0], balance: x[1].value }));

    const element = createEntry(x.item.name, left, right);
    element.style.paddingBottom = "30px";
    container.appendChild(element);
  });

  return container;
}

function createEntry(
  accountName: string,
  left: NameBalancePair[],
  right: NameBalancePair[]
): HTMLElement {
  const container = document.createElement("div");
  const table = document.createElement("table");
  const count = Math.max(left.length, right.length);

  for (var index = 0; index < count; index++) {
    const row = document.createElement("tr");

    if (index < left.length) {
      populateEntrySide(row, left[index], true);
    } else if (index == left.length) {
      populateEmptyRow(row, count - index, true);
    }

    if (index < right.length) {
      populateEntrySide(row, right[index], false);
    } else if (index == right.length) {
      populateEmptyRow(row, count - index, false);
    }

    table.appendChild(row);
  }

  const { leftSum, rightSum } = closeTable(table, left, right);

  container.className = "container w-full d-block";
  container.appendChild(createHeader(accountName));
  container.appendChild(table);

  verifyAccount(container, leftSum, rightSum, left.concat(right));

  return container;
}

const sumItem: BalanceItem = { name: "", category: "fixed-assets", id: "sum" };

function closeTable(
  table: HTMLTableElement,
  left: NameBalancePair[],
  right: NameBalancePair[]
): { leftSum: number; rightSum: number } {
  const reducer = (accumulator: number, currentValue: number) =>
    accumulator + currentValue;

  const row = document.createElement("tr");

  const data = {
    leftSum: left.map((x) => x.balance).reduce(reducer, 0),
    rightSum: right.map((x) => x.balance).reduce(reducer, 0),
  };

  populateEntrySide(row, { name: sumItem.name, balance: data.leftSum }, true);
  populateEntrySide(row, { name: sumItem.name, balance: data.rightSum }, false);
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

  cell.colSpan = 5;
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
  info: NameBalancePair,
  showSeparator: boolean
) {
  const ordinal = document.createElement("td");
  const space = document.createElement("td");
  const valuePart3 = document.createElement("td");
  const valuePart2 = document.createElement("td");
  const valuePart1 = document.createElement("td");

  const fractionPart = ((info.balance % 1) * 100).toFixed(0).padStart(2, "0");
  const integerPart = info.balance.toFixed(0);
  const offset = Math.max(integerPart.length - 3, 0);
  const rightPart = integerPart.substring(offset);
  const leftPart = integerPart.substring(0, offset);

  valuePart1.innerText = leftPart;
  valuePart2.innerText = rightPart;
  valuePart3.innerText = fractionPart;
  ordinal.innerText = info.name;

  row.className = "balance-row";
  space.className = "balance-spacer";

  valuePart3.className = "balance-column text-right";
  valuePart2.className = "balance-column font-weight-medium text-right";
  valuePart1.className = "balance-column font-weight-medium text-right";

  if (showSeparator) {
    valuePart3.className += " balance-line";
  }

  if (info.name === sumItem.name) {
    valuePart1.className += " sum-underline";
    valuePart2.className += " sum-underline";
    valuePart3.className += " sum-underline";
  }

  row.appendChild(ordinal);
  row.appendChild(space);

  row.appendChild(valuePart1);
  row.appendChild(valuePart2);
  row.appendChild(valuePart3);
}

export function createHeader(account: string): HTMLElement {
  const row = document.createElement("div");
  const left = document.createElement("span");
  const name = document.createElement("span");
  const right = document.createElement("span");

  left.innerText = "SOLL";
  right.innerText = "HABEN";
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
