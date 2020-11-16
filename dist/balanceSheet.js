"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccounts = void 0;
function createAccounts(sheet) {
    var accounts = {};
    // start with adding the stocks to the accounts
    sheet.stocks.forEach(function (stock) {
        accounts[stock.item.name] = {
            entries: { AB: stock },
            item: stock.item,
        };
    });
    // add entries
    sheet.entries.forEach(function (x, index) {
        if (x.ignore) {
            return;
        }
        var entryName = index + 1 + ")";
        x.debit.concat(x.credit).forEach(function (x) {
            if (!accounts[x.item.name]) {
                accounts[x.item.name] = {
                    item: x.item,
                    entries: { AB: { item: x.item, value: 0 } },
                };
            }
            accounts[x.item.name].entries[entryName] = {
                item: __assign({}, x.item),
                value: x.value,
            };
        });
    });
    // close the accounts
    return Object.values(accounts).map(function (x) {
        // compute highest "side"
        var left = 0;
        var right = 0;
        Object.values(x.entries).forEach(function (x) {
            if (x.item.category !== "passive") {
                left += x.value;
            }
            else {
                right += x.value;
            }
        });
        var difference = Math.abs(left - right);
        var category = left > right ? "passive" : "fixed-assets";
        var closingBalance = (x.entries["SBK"] = {
            item: { name: "SBK", category: category },
            value: difference,
        });
        return __assign({ closingBalance: closingBalance }, x);
    });
}
exports.createAccounts = createAccounts;
//# sourceMappingURL=balanceSheet.js.map