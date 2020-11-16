import { remote } from "electron";
import { writeFile } from "fs";
import { BalanceItem, BalanceSheet } from "./balanceSheet";
import { ClosingBalancePage } from "./pages/closingBalancePage";
import { showPage } from "./pages/navigator";
import { storage } from "./storage";
import exportSheet from "./util/exportHelper";

var halfmoon = require("halfmoon");

const focusedWindow = remote.BrowserWindow.getFocusedWindow();

document
  .getElementById("sticky-dark-toggler")
  .addEventListener("click", function () {
    halfmoon.toggleDarkMode();
  });

document.getElementById("print-button").addEventListener("click", function () {
  var printer = require("print-html-element");
  printer.printElement(document.getElementById("content-wrapper"));
});

document.getElementById("save-button").addEventListener("click", function () {
  const result = remote.dialog.showSaveDialogSync(focusedWindow, {
    filters: [{ extensions: ["bew"], name: "BEW-Dateien" }],
  });

  if (!result) {
    return;
  }

  const data = JSON.stringify(storage, null, 2);
  writeFile(result, data, () => {});
});

document.getElementById("export-button").addEventListener("click", function () {
  exportSheet();
});

document.getElementById("open-button").addEventListener("click", function () {
  const result = remote.dialog.showOpenDialogSync(focusedWindow, {
    filters: [{ extensions: ["bew"], name: "BEW-Dateien" }],
  });

  if (!result) {
    return;
  }

  for (var member in storage) delete storage[member];
  Object.assign(storage, JSON.parse(result[0]));
  showPage(ClosingBalancePage);
});

showPage(ClosingBalancePage);

const items: { [key: string]: BalanceItem } = {
  grundstücke: {
    name: "Grundstücke",
    category: "fixed-assets",
  },
  maschinen: {
    name: "Maschinen",
    category: "fixed-assets",
  },
  bga: {
    name: "Betriebs- und Geschäftsaustattung",
    category: "fixed-assets",
  },
  rohstoffe: {
    name: "Rohstoffe",
    category: "current-assets",
  },
  forderungenALL: {
    name: "Forderungen aus Lieferungen und Leistungen",
    category: "current-assets",
  },
  bank: {
    name: "Bankguthaben",
    category: "current-assets",
  },
  kasse: {
    name: "Kassenbestand",
    category: "current-assets",
  },
  eigenkapital: {
    name: "Eigenkapital",
    category: "passive",
  },
  darlehen: {
    name: "Darlehen",
    category: "passive",
  },
  verbindlichkeitenALL: {
    name: "Verbindlichkeiten aus Lieferungen und Leistungen",
    category: "passive",
  },
};

export const sheet: BalanceSheet = {
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
      description:
        "Von der bereits gebuchten Büromöbellieferung schicken wir einen nicht bestellten Posten zurück.",
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
      description:
        "Ein Kunde bezahlt einen Rechnungsbetrag durch Banküberweisung",
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
      description:
        "Wir tilgen teilweise die Darlehensschuld bei der Bank durch Barzahlung.",
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

storage.sheet = sheet;
storage.items = Object.values(items);
