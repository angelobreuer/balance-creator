"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHeader = exports.renderSheet = exports.renderClosingSheet = void 0;
var currencyHelper_1 = require("./currencyHelper");
var accountantNose = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMDAgMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiNjYWNhY2E7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO308L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOTksMC41SDY5Yy0xNy4zMyw4LjMzLTMwLjY3LDE2LjY3LTQ3LDI0Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Im0wLjUgMjQuNWgyMSIvPgo8L3N2Zz4K')";
function renderClosingSheet(accounts) {
    var container = document.createElement("div");
    var active = [];
    var passive = [];
    accounts.forEach(function (x) {
        if (x.closingBalance.item.type === "passive") {
            active.push({ name: x.name, value: x.closingBalance.value });
        }
        else {
            passive.push({ name: x.name, value: x.closingBalance.value });
        }
    });
    var element = createEntry("Abschlussbilanz", active, passive);
    container.append(element);
    return container;
}
exports.renderClosingSheet = renderClosingSheet;
function renderSheet(accounts) {
    var container = document.createElement("div");
    accounts.forEach(function (x) {
        var entries = Object.entries(x.entries);
        var left = entries
            .filter(function (x) { return x[1].item.type == "active"; })
            .map(function (x) { return ({ name: x[0], value: x[1].value }); });
        var right = entries
            .filter(function (x) { return x[1].item.type == "passive"; })
            .map(function (x) { return ({ name: x[0], value: x[1].value }); });
        var element = createEntry(x.name, left, right);
        element.style.paddingBottom = "30px";
        container.appendChild(element);
    });
    return container;
}
exports.renderSheet = renderSheet;
function createEntry(accountName, left, right) {
    var container = document.createElement("div");
    var table = document.createElement("table");
    var count = Math.max(left.length, right.length);
    for (var index = 0; index < count; index++) {
        var row = document.createElement("tr");
        if (index < left.length) {
            populateEntrySide(row, left[index]);
        }
        else if (index == left.length) {
            populateEmptyRow(row, count - index);
        }
        populateLine(row);
        if (index < right.length) {
            populateEntrySide(row, right[index]);
        }
        else if (index == right.length) {
            populateEmptyRow(row, count - index);
        }
        table.appendChild(row);
    }
    var _a = closeTable(table, left, right), leftSum = _a.leftSum, rightSum = _a.rightSum;
    container.className = "container w-full d-block";
    container.appendChild(createHeader(accountName));
    container.appendChild(table);
    if (leftSum !== rightSum) {
        showWarning(container, "Die Summen sind nicht wertegleich (" + currencyHelper_1.default(leftSum) + " \u2260 " + currencyHelper_1.default(rightSum) + ").", "bug");
    }
    if (leftSum < 0 || rightSum < 0) {
        showWarning(container, "Eine Summe hat einen negativen Wert.", "exclamation-circle");
    }
    var failingAccount = left.concat(right).find(function (x) { return x.value < 0; });
    if (failingAccount) {
        showWarning(container, "Der Posten " + failingAccount.name + " hat einen negativen Wert (" + currencyHelper_1.default(failingAccount.value) + ").", "exclamation-circle");
    }
    return container;
}
function showWarning(container, text, iconName) {
    var warningContainer = document.createElement("div");
    var warningText = document.createElement("span");
    var icon = document.createElement("i");
    warningContainer.style.color = "red";
    warningContainer.style.paddingTop = "15px";
    warningText.innerText = text;
    warningText.style.padding = "5px";
    icon.className = "fa fa-" + iconName;
    warningContainer.appendChild(icon);
    warningContainer.appendChild(warningText);
    container.appendChild(warningContainer);
}
var sumItem = { name: "Summe", type: "active" };
function closeTable(table, left, right) {
    var reducer = function (accumulator, currentValue) {
        return accumulator + currentValue;
    };
    var row = document.createElement("tr");
    var data = {
        leftSum: left.map(function (x) { return x.value; }).reduce(reducer, 0),
        rightSum: right.map(function (x) { return x.value; }).reduce(reducer, 0),
    };
    populateEntrySide(row, { name: sumItem.name, value: data.leftSum });
    populateLine(row);
    populateEntrySide(row, { name: sumItem.name, value: data.rightSum });
    table.appendChild(row);
    return data;
}
function populateEmptyRow(row, rows) {
    var cell = document.createElement("td");
    var image = document.createElement("div");
    cell.colSpan = 5;
    cell.rowSpan = rows;
    image.style.backgroundImage = accountantNose;
    image.style.width = "100%";
    image.style.height = (30 * rows).toString() + "px";
    image.style.display = "block";
    cell.appendChild(image);
    row.appendChild(cell);
}
function populateLine(row) {
    var cell = document.createElement("td");
    cell.className = "balance-line";
    row.appendChild(cell);
}
function populateEntrySide(row, info) {
    var ordinal = document.createElement("td");
    var space = document.createElement("td");
    var valuePart3 = document.createElement("td");
    var valuePart2 = document.createElement("td");
    var valuePart1 = document.createElement("td");
    var fractionPart = ((info.value % 1) * 100).toFixed(0).padStart(2, "0");
    var integerPart = info.value.toFixed(0);
    var offset = Math.max(integerPart.length - 3, 0);
    var rightPart = integerPart.substring(offset);
    var leftPart = integerPart.substring(0, offset);
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
function createHeader(account) {
    var row = document.createElement("div");
    var left = document.createElement("span");
    var name = document.createElement("span");
    var right = document.createElement("span");
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
exports.createHeader = createHeader;
//# sourceMappingURL=balanceEntry.js.map