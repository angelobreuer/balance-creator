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
exports.createAccounts = exports.sheet = void 0;
var items = {
    grundstücke: {
        name: "Grundstücke",
        type: "active",
        category: "fixed-assets",
    },
    maschinen: {
        name: "Maschinen",
        type: "active",
        category: "fixed-assets",
    },
    bga: {
        name: "Betriebs- und Geschäftsaustattung",
        type: "active",
        category: "fixed-assets",
    },
    rohstoffe: {
        name: "Rohstoffe",
        type: "active",
        category: "current-assets",
    },
    forderungenALL: {
        name: "Forderungen aus Lieferungen und Leistungen",
        type: "active",
        category: "current-assets",
    },
    bank: {
        name: "Bankguthaben",
        type: "active",
        category: "current-assets",
    },
    kasse: {
        name: "Kassenbestand",
        type: "active",
        category: "current-assets",
    },
    eigenkapital: {
        name: "Eigenkapital",
        type: "passive",
    },
    darlehen: {
        name: "Darlehen",
        type: "passive",
    },
    verbindlichkeitenALL: {
        name: "Verbindlichkeiten aus Lieferungen und Leistungen",
        type: "passive",
    },
};
exports.sheet = {
    stocks: [
        {
            item: items.grundstücke,
            value: 965000,
        },
        {
            item: items.maschinen,
            value: 470500,
        },
        {
            item: items.bga,
            value: 84900,
        },
        {
            item: items.rohstoffe,
            value: 54800,
        },
        {
            item: items.forderungenALL,
            value: 105450,
        },
        {
            item: items.bank,
            value: 17770,
        },
        {
            item: items.kasse,
            value: 25100,
        },
        {
            item: items.eigenkapital,
            value: 892320,
        },
        {
            item: items.darlehen,
            value: 450000,
        },
        {
            item: items.verbindlichkeitenALL,
            value: 381200,
        },
    ],
    entries: [
        {
            debit: [
                {
                    item: items.bga,
                    value: 27000,
                },
            ],
            credit: [
                {
                    item: items.verbindlichkeitenALL,
                    value: 27000,
                },
            ],
            description: "Eingangsrechnung für Buromöbel",
        },
        {
            debit: [
                {
                    item: items.verbindlichkeitenALL,
                    value: 4000,
                },
            ],
            credit: [
                {
                    item: items.bga,
                    value: 4000,
                },
            ],
            description: "Von der bereits gebuchten Büromöbellieferung schicken wir einen nicht bestellten Posten zurück.",
        },
        {
            debit: [
                {
                    item: items.bank,
                    value: 32000,
                },
            ],
            credit: [
                {
                    item: items.forderungenALL,
                    value: 32000,
                },
            ],
            description: "Ein Kunde bezahlt einen Rechnungsbetrag durch Banküberweisung",
        },
        {
            debit: [
                {
                    item: items.darlehen,
                    value: 7200,
                },
            ],
            credit: [
                {
                    item: items.kasse,
                    value: 7200,
                },
            ],
            description: "Wir tilgen teilweise die Darlehensschuld bei der Bank durch Barzahlung.",
        },
        {
            debit: [
                {
                    item: items.maschinen,
                    value: 87700,
                },
            ],
            credit: [
                {
                    item: items.verbindlichkeitenALL,
                    value: 87700,
                },
            ],
            description: "Wir kaufen eine Abfüllmaschine auf Ziel.",
        },
        {
            debit: [
                {
                    item: items.verbindlichkeitenALL,
                    value: 28570,
                },
            ],
            credit: [
                {
                    item: items.kasse,
                    value: 6570,
                },
                {
                    item: items.bank,
                    value: 22000,
                },
            ],
            description: "Wir zahlen eine Lieferantenrechnung.",
        },
        {
            debit: [
                {
                    item: items.bga,
                    value: 2600,
                },
            ],
            credit: [
                {
                    item: items.kasse,
                    value: 2600,
                },
            ],
            description: "Barkauf mehrere Schreibtische für das Büro.",
        },
        {
            debit: [
                {
                    item: items.grundstücke,
                    value: 67000,
                },
            ],
            credit: [
                {
                    item: items.verbindlichkeitenALL,
                    value: 67000,
                },
            ],
            description: "Kauf eines Grundstücks für einen Parkplatz auf Ziel.",
        },
    ],
};
function createAccounts(sheet) {
    var accounts = {};
    // start with adding the stocks to the accounts
    sheet.stocks.forEach(function (stock) {
        accounts[stock.item.name] = {
            entries: { AB: stock },
            name: stock.item.name,
        };
    });
    // add entries
    sheet.entries.forEach(function (x, index) {
        var entryName = index + 1 + ")";
        x.debit.forEach(function (x) {
            accounts[x.item.name].entries[entryName] = {
                item: __assign(__assign({}, x.item), { type: "active" }),
                value: x.value,
            };
        });
        x.credit.forEach(function (x) {
            accounts[x.item.name].entries[entryName] = {
                item: __assign(__assign({}, x.item), { type: "passive" }),
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
            if (x.item.type === "active") {
                left += x.value;
            }
            else {
                right += x.value;
            }
        });
        var difference = Math.abs(left - right);
        var type = left > right ? "passive" : "active";
        var closingBalance = (x.entries["SBK"] = {
            item: { name: "SBK", type: type },
            value: difference,
        });
        return __assign({ closingBalance: closingBalance }, x);
    });
}
exports.createAccounts = createAccounts;
//# sourceMappingURL=balanceSheet.js.map