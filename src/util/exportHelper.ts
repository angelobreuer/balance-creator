import { readFileSync, mkdir, writeFile, stat, existsSync } from "original-fs";
import { BalanceSheetEntry, createAccounts, resolveRef } from "../balanceSheet";
import { renderBalance } from "../balanceSheetRenderer";
import { storage } from "../storage";
import { resolve } from "path";
import open = require("open");
import formatCurrency from "./currencyHelper";
import { renderAccounts } from "../accountRenderer";
import { promisify } from "util";

var mkdirAsync = promisify(mkdir);
var writeFileAsync = promisify(writeFile);

import halfmoonCss from "../css/halfmoon.min.css";
import mainCss from "../css/main.css";

async function addStylesheet(
  head: HTMLHeadElement,
  path: string
): Promise<void> {
  const style = document.createElement("style");
  const response = await fetch(path);
  style.innerHTML = await response.text();
  head.appendChild(style);
}

export interface ExportOptions {
  exportOpeningBalance?: boolean;
  exportClosingBalance?: boolean;
  exportAccounts?: boolean;
  exportBookings?: boolean;
  exportStocks?: boolean;
  exportPosts?: boolean;
  openPrintDialog?: boolean;
}

export const defaultExportOptions: ExportOptions = {
  exportOpeningBalance: true,
  exportAccounts: true,
  exportClosingBalance: true,
  exportBookings: true,
  exportStocks: false,
  exportPosts: false,
  openPrintDialog: true,
};

function exportAccounts(): HTMLElement {
  const accounts = createAccounts(storage.sheet);
  const accountsElement = document.createElement("div");
  accountsElement.className = "accounts";
  accountsElement.appendChild(renderAccounts(accounts));
  return accountsElement;
}

function exportClosingBalance(): HTMLElement {
  const accounts = createAccounts(storage.sheet).filter((x) => x.entries.SBK);
  const balanceElement = document.createElement("div");
  balanceElement.className = "balance";

  const stocks = accounts.map((x) => ({
    item: x.item,
    value: x.entries["SBK"].value,
  }));

  balanceElement.appendChild(renderBalance("Schlussbilanz", stocks));
  return balanceElement;
}

function exportOpeningBalance(): HTMLElement {
  const balanceElement = document.createElement("div");
  balanceElement.className = "balance";

  const stocks = storage.sheet.stocks.map((x) => ({
    item: resolveRef(x.item),
    value: x.value,
  }));

  balanceElement.appendChild(renderBalance("Eröffnungsbilanz", stocks));
  return balanceElement;
}

export function exportPosts(): HTMLElement {
  const active = storage.items.filter((x) => x.category !== "passive");
  const passive = storage.items.filter((x) => x.category === "passive");

  const element = document.createElement("table");
  const headerRow = document.createElement("tr");
  const activeHeader = document.createElement("td");
  const passiveHeader = document.createElement("td");

  element.className = "mt-20";

  activeHeader.textContent = "Aktiv";
  passiveHeader.textContent = "Passiv";

  headerRow.appendChild(activeHeader);
  headerRow.appendChild(passiveHeader);

  element.appendChild(headerRow);

  for (
    var index = 0;
    index < Math.max(active.length, passive.length);
    index++
  ) {
    const contentRow = document.createElement("tr");
    const activeColumn = document.createElement("td");
    const passiveColumn = document.createElement("td");

    if (index < active.length) {
      activeColumn.textContent = active[index].name;
    }

    if (index < passive.length) {
      passiveColumn.textContent = passive[index].name;
    }

    contentRow.appendChild(activeColumn);
    contentRow.appendChild(passiveColumn);
    element.appendChild(contentRow);
  }

  return element;
}

export function exportBookings(): HTMLElement {
  const container = document.createElement("div");

  storage.sheet.entries.forEach((x, i) =>
    container.appendChild(exportBooking(x, i))
  );

  return container;
}

function exportBooking(
  booking: BalanceSheetEntry,
  index: number
): HTMLDivElement {
  const container = document.createElement("div");
  const table = document.createElement("table");
  const description = document.createElement("h5");

  table.className = "bookings";

  description.innerText = `${index + 1}) ${booking.description}`;

  const count = Math.max(booking.credit.length, booking.debit.length);

  for (let index = 0; index < count; index++) {
    const row = document.createElement("tr");
    const debitCell = document.createElement("td");
    const spacerCell = document.createElement("td");
    const creditCell = document.createElement("td");

    if (index === 0) {
      spacerCell.innerText = "an";
    }

    if (index < booking.debit.length) {
      const info = booking.debit[index];
      debitCell.className = "booking-info";

      debitCell.innerText = `${resolveRef(info.item).name} ${formatCurrency(
        info.value
      )}`;
    }

    if (index < booking.credit.length) {
      const info = booking.credit[index];
      creditCell.className = "booking-info";

      creditCell.innerText = `${resolveRef(info.item).name} ${formatCurrency(
        info.value
      )}`;
    }

    row.appendChild(debitCell);
    row.appendChild(spacerCell);
    row.appendChild(creditCell);
    table.appendChild(row);
  }

  container.appendChild(description);
  container.appendChild(table);

  return container;
}

export function exportStocks(): HTMLElement {
  const element = document.createElement("table");

  const headerRow = document.createElement("tr");
  const headerColumn1 = document.createElement("td");
  const headerColumn2 = document.createElement("td");

  headerColumn1.textContent = "Posten";
  headerColumn2.textContent = "Anfangsbestand";

  element.className = "mt-20";

  headerRow.appendChild(headerColumn1);
  headerRow.appendChild(headerColumn2);

  element.appendChild(headerRow);

  storage.sheet.stocks.forEach((x) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const value = document.createElement("td");

    name.textContent = resolveRef(x.item).name;
    value.textContent = formatCurrency(x.value);

    row.appendChild(name);
    row.appendChild(value);
    element.appendChild(row);
  });

  return element;
}

export async function generateHTML(options: ExportOptions): Promise<string> {
  const webRoot = document.createElement("html");
  const body = document.createElement("body");
  const head = document.createElement("head");
  const wrapper = document.createElement("div");

  head.innerHTML = '<meta charset="utf-8" />';
  wrapper.className = "container-lg";

  body.appendChild(wrapper);

  if (options.openPrintDialog) {
    body.setAttribute("onload", "window.print()");
  }

  await addStylesheet(head, halfmoonCss);
  await addStylesheet(head, mainCss);

  if (options.exportPosts) {
    wrapper.appendChild(exportPosts());
  }

  if (options.exportStocks) {
    wrapper.appendChild(exportStocks());
  }

  if (options.exportOpeningBalance) {
    wrapper.appendChild(exportOpeningBalance());
  }

  if (options.exportAccounts) {
    wrapper.appendChild(exportAccounts());
  }

  if (options.exportBookings) {
    wrapper.appendChild(exportBookings());
  }

  if (options.exportClosingBalance) {
    wrapper.appendChild(exportClosingBalance());
  }

  webRoot.appendChild(head);
  webRoot.appendChild(body);

  return webRoot.outerHTML;
}

export default async function exportHTML(options: ExportOptions) {
  const folder = resolve(
    process.env.APPDATA || process.env.LOCAL_APPDATA || process.env.HOME,
    "Bilanzenersteller",
    "exports"
  );

  if (!existsSync(folder)) {
    await mkdirAsync(folder);
  }

  const id = Math.random().toString(36).substring(7);
  const filename = resolve(folder, id + ".html");
  const html = await generateHTML(options);

  await writeFileAsync(filename, html);
  await open(filename);
}
