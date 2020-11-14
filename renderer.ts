import { renderClosingSheet, renderSheet } from "./balanceEntry";
import { createAccounts, sheet } from "./balanceSheet";
var halfmoon = require("halfmoon");

const output = document.getElementById("balance-output");

document
  .getElementById("sticky-dark-toggler")
  .addEventListener("click", function () {
    halfmoon.toggleDarkMode();
  });

document.getElementById("print-button").addEventListener("click", function () {
  var printer = require("print-html-element");
  printer.printElement(output);
});

const accounts = createAccounts(sheet);
output.appendChild(renderSheet(accounts));
output.appendChild(renderClosingSheet(accounts));
