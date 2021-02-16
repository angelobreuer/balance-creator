import NameBalancePair from "./balancePair";
import { verifyAccount } from "./util/tAccountHelper";
import {
  BalanceItem,
  BalanceAccount,
  isBookedOnDebit,
  isBookedOnCredit,
} from "./balanceSheet";
import accountantNose from "./util/accountantNose";

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
      populateEntrySide(row, left[index]);
    } else if (index == left.length) {
      populateEmptyRow(row, count - index, true);
    }

    if (index < right.length) {
      populateEntrySide(row, right[index]);
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

  populateEntrySide(row, { name: sumItem.name, balance: data.leftSum });
  populateEntrySide(row, { name: sumItem.name, balance: data.rightSum });
  table.appendChild(row);

  return data;
}

function populateEmptyRow(
  row: HTMLTableRowElement,
  rows: number,
  showSeparator: boolean
) {
  const cell = document.createElement("td");
  const image = document.createElement("img");

  cell.rowSpan = rows;
  cell.className = "b-cell";

  image.style.width = "100%";
  image.style.height = (30 * rows).toString() + "px";
  image.style.display = "block";
  image.src = accountantNose;

  if (showSeparator) {
    cell.className = "balance-line";
  }

  cell.appendChild(image);
  row.appendChild(cell);
}

function populateEntrySide(row: HTMLTableRowElement, info: NameBalancePair) {
  const cell = document.createElement("td");
  const innerCell = document.createElement("div");
  const ordinal = document.createElement("div");
  const values = document.createElement("div");
  const valuePart3 = document.createElement("div");
  const valuePart2 = document.createElement("div");
  const valuePart1 = document.createElement("div");

  const fractionPart = ((info.balance % 1) * 100).toFixed(0).padStart(2, "0");
  const integerPart = info.balance.toFixed(0);
  const offset = Math.max(integerPart.length - 3, 0);
  const rightPart = integerPart.substring(offset);
  const leftPart = integerPart.substring(0, offset);

  valuePart1.innerText = leftPart;
  valuePart2.innerText = rightPart;
  valuePart3.innerText = fractionPart;
  ordinal.innerText = info.name;

  cell.className = "b-cell";
  row.className = "balance-row";
  innerCell.className = "d-flex";

  ordinal.className = "flex-grow-1 d-inline-block";
  valuePart3.className = "b-col text-right d-inline-block";
  valuePart2.className = "b-col font-weight-medium text-right d-inline-block";
  valuePart1.className = "b-col font-weight-medium text-right d-inline-block";

  if (info.name === sumItem.name) {
    values.className = "sum-underline";
  }

  cell.appendChild(innerCell);
  row.appendChild(cell);

  values.appendChild(valuePart1);
  values.appendChild(valuePart2);
  values.appendChild(valuePart3);

  innerCell.appendChild(ordinal);
  innerCell.appendChild(values);
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
