import { readFileSync, mkdir, writeFile } from "original-fs";
import { renderSheet } from "../accountRenderer";
import { createAccounts } from "../balanceSheet";
import { renderBalance } from "../balanceSheetRenderer";
import { storage } from "../storage";
import { resolve } from "path";
import open = require("open");

function addStylesheet(head: HTMLHeadElement, path: string) {
  const style = document.createElement("style");

  style.innerHTML = readFileSync(resolve(__dirname, path), {
    encoding: "utf8",
  });

  head.appendChild(style);
}

export default function exportSheet() {
  const webRoot = document.createElement("html");
  const body = document.createElement("body");
  const head = document.createElement("head");

  head.innerHTML = '<meta charset="utf-8" />';

  addStylesheet(head, "../css/main.css");
  addStylesheet(head, "../css/halfmoon.min.css");

  const accounts = createAccounts(storage.sheet);
  const accountsElement = document.createElement("div");
  accountsElement.className = "accounts";
  accountsElement.appendChild(renderSheet(accounts));

  const balanceElement = document.createElement("div");
  balanceElement.className = "balance";

  const stocks = accounts.map((x) => ({
    item: x.item,
    value: x.closingBalance.value,
  }));

  balanceElement.appendChild(renderBalance("Schlussbilanz", stocks));

  body.appendChild(accountsElement);
  body.appendChild(balanceElement);

  webRoot.appendChild(head);
  webRoot.appendChild(body);

  mkdir("exports/", (x) => {
    const id = Math.random().toString(36).substring(7);
    const filename = resolve("exports/" + id + ".html");

    writeFile(filename, webRoot.outerHTML, (x) => {
      open(filename);
    });
  });
}
