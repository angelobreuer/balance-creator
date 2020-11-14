"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var balanceEntry_1 = require("./balanceEntry");
var balanceSheet_1 = require("./balanceSheet");
var halfmoon = require("halfmoon");
var output = document.getElementById("balance-output");
document
    .getElementById("sticky-dark-toggler")
    .addEventListener("click", function () {
    halfmoon.toggleDarkMode();
});
document.getElementById("print-button").addEventListener("click", function () {
    var printer = require("print-html-element");
    printer.printElement(output);
});
var accounts = balanceSheet_1.createAccounts(balanceSheet_1.sheet);
output.appendChild(balanceEntry_1.renderSheet(accounts));
output.appendChild(balanceEntry_1.renderClosingSheet(accounts));
//# sourceMappingURL=renderer.js.map