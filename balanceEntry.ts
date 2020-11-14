import { BalanceAccount, BalanceItem } from "./balanceSheet";
import formatCurrency from "./currencyHelper";

const accountantNose: string =
  "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMDAgMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiNjYWNhY2E7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO308L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOTksMC41SDY5Yy0xNy4zMyw4LjMzLTMwLjY3LDE2LjY3LTQ3LDI0Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Im0wLjUgMjQuNWgyMSIvPgo8L3N2Zz4K')";

export function renderClosingSheet(accounts: BalanceAccount[]): HTMLElement {
  const container = document.createElement("div");
  const active: BalanceInfo[] = [];
  const passive: BalanceInfo[] = [];

  accounts.forEach((x) => {
    if (x.closingBalance.item.type === "passive") {
      active.push({ name: x.name, value: x.closingBalance.value });
    } else {
      passive.push({ name: x.name, value: x.closingBalance.value });
    }
  });

  const element = createEntry("Abschlussbilanz", active, passive);
  container.append(element);

  return container;
}

export function renderSheet(accounts: BalanceAccount[]): HTMLElement {
  const container = document.createElement("div");

  accounts.forEach((x) => {
    const entries = Object.entries(x.entries);

    const left: BalanceInfo[] = entries
      .filter((x) => x[1].item.type == "active")
      .map((x) => ({ name: x[0], value: x[1].value }));

    const right: BalanceInfo[] = entries
      .filter((x) => x[1].item.type == "passive")
      .map((x) => ({ name: x[0], value: x[1].value }));

    const element = createEntry(x.name, left, right);
    element.style.paddingBottom = "30px";
    container.appendChild(element);
  });

  return container;
}

interface BalanceInfo {
  name: string;
  value: number;
}

function createEntry(
  accountName: string,
  left: BalanceInfo[],
  right: BalanceInfo[]
): HTMLElement {
  const container = document.createElement("div");
  const table = document.createElement("table");
  const count = Math.max(left.length, right.length);

  for (var index = 0; index < count; index++) {
    const row = document.createElement("tr");

    if (index < left.length) {
      populateEntrySide(row, left[index]);
    } else if (index == left.length) {
      populateEmptyRow(row, count - index);
    }

    populateLine(row);

    if (index < right.length) {
      populateEntrySide(row, right[index]);
    } else if (index == right.length) {
      populateEmptyRow(row, count - index);
    }

    table.appendChild(row);
  }

  const { leftSum, rightSum } = closeTable(table, left, right);

  container.className = "container w-full d-block";
  container.appendChild(createHeader(accountName));
  container.appendChild(table);

  if (leftSum !== rightSum) {
    showWarning(
      container,
      `Die Summen sind nicht wertegleich (${formatCurrency(
        leftSum
      )} ≠ ${formatCurrency(rightSum)}).`,
      "bug"
    );
  }

  if (leftSum < 0 || rightSum < 0) {
    showWarning(
      container,
      "Eine Summe hat einen negativen Wert.",
      "exclamation-circle"
    );
  }

  const failingAccount = left.concat(right).find((x) => x.value < 0);

  if (failingAccount) {
    showWarning(
      container,
      `Der Posten ${
        failingAccount.name
      } hat einen negativen Wert (${formatCurrency(failingAccount.value)}).`,
      "exclamation-circle"
    );
  }

  return container;
}

function showWarning(container: HTMLElement, text: string, iconName: string) {
  const warningContainer = document.createElement("div");
  const warningText = document.createElement("span");
  const icon = document.createElement("i");

  warningContainer.style.color = "red";
  warningContainer.style.paddingTop = "15px";

  warningText.innerText = text;
  warningText.style.padding = "5px";

  icon.className = "fa fa-" + iconName;

  warningContainer.appendChild(icon);
  warningContainer.appendChild(warningText);
  container.appendChild(warningContainer);
}

const sumItem: BalanceItem = { name: "Summe", type: "active" };

function closeTable(
  table: HTMLTableElement,
  left: BalanceInfo[],
  right: BalanceInfo[]
): { leftSum: number; rightSum: number } {
  const reducer = (accumulator: number, currentValue: number) =>
    accumulator + currentValue;

  const row = document.createElement("tr");

  const data = {
    leftSum: left.map((x) => x.value).reduce(reducer, 0),
    rightSum: right.map((x) => x.value).reduce(reducer, 0),
  };

  populateEntrySide(row, { name: sumItem.name, value: data.leftSum });
  populateLine(row);
  populateEntrySide(row, { name: sumItem.name, value: data.rightSum });
  table.appendChild(row);

  return data;
}

function populateEmptyRow(row: HTMLTableRowElement, rows: number) {
  const cell = document.createElement("td");
  const image = document.createElement("div");

  cell.colSpan = 5;
  cell.rowSpan = rows;

  image.style.backgroundImage = accountantNose;
  image.style.width = "100%";
  image.style.height = (30 * rows).toString() + "px";
  image.style.display = "block";

  cell.appendChild(image);
  row.appendChild(cell);
}

function populateLine(row: HTMLTableRowElement) {
  const cell = document.createElement("td");
  cell.className = "balance-line";
  row.appendChild(cell);
}

function populateEntrySide(row: HTMLTableRowElement, info: BalanceInfo) {
  const ordinal = document.createElement("td");
  const space = document.createElement("td");
  const valuePart3 = document.createElement("td");
  const valuePart2 = document.createElement("td");
  const valuePart1 = document.createElement("td");

  const fractionPart = ((info.value % 1) * 100).toFixed(0).padStart(2, "0");
  const integerPart = info.value.toFixed(0);
  const offset = Math.max(integerPart.length - 3, 0);
  const rightPart = integerPart.substring(offset);
  const leftPart = integerPart.substring(0, offset);

  valuePart1.innerText = leftPart;
  valuePart2.innerText = rightPart;
  valuePart3.innerText = fractionPart;
  ordinal.innerText = info.name;

  row.className = "balance-row";
  ordinal.className = "balance-column";
  space.className = "balance-column spacer";

  valuePart3.className = "balance-column text-right";
  valuePart2.className = "balance-column font-weight-medium text-right";
  valuePart1.className = "balance-column font-weight-medium text-right";

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
  name.innerText = account;
  right.innerText = "HABEN";

  row.className = "d-flex flex-row w-full align-items-center";
  left.className = "p-5 text-left font-weight-bold";
  name.className = "font-weight-bolder flex-grow-1 text-center";
  right.className = "font-weight-bold";

  row.appendChild(left);
  row.appendChild(name);
  row.appendChild(right);

  return row;
}
