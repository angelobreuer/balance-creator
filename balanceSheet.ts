export interface BalanceSheet {
  entries: BalanceSheetEntry[];
  stocks: BalanceStock[];
}

export interface BalanceStock {
  item: BalanceItem;
  value: number;
}

export interface BalanceSheetEntry {
  description?: string;
  debit: BalanceStock[];
  credit: BalanceStock[];
}

export interface BalanceAccount {
  name: string;
  entries: { [key: string]: BalanceStock };
  closingBalance: BalanceStock;
}

export interface BalanceItem {
  name: string;
  type: BalanceItemType;
  category?: BalanceItemCategory;
}

export type BalanceItemType = "active" | "passive";
export type BalanceItemCategory = "fixed-assets" | "current-assets";

const items: { [key: string]: BalanceItem } = {
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

export function createAccounts(sheet: BalanceSheet): BalanceAccount[] {
  const accounts: {
    [itemName: string]: {
      name: string;
      entries: { [key: string]: BalanceStock };
    };
  } = {};

  // start with adding the stocks to the accounts
  sheet.stocks.forEach((stock) => {
    accounts[stock.item.name] = {
      entries: { AB: stock },
      name: stock.item.name,
    };
  });

  // add entries
  sheet.entries.forEach((x, index) => {
    const entryName = index + 1 + ")";

    x.debit.forEach((x) => {
      accounts[x.item.name].entries[entryName] = {
        item: { ...x.item, type: "active" },
        value: x.value,
      };
    });

    x.credit.forEach((x) => {
      accounts[x.item.name].entries[entryName] = {
        item: { ...x.item, type: "passive" },
        value: x.value,
      };
    });
  });

  // close the accounts
  return Object.values(accounts).map((x) => {
    // compute highest "side"
    var left = 0;
    var right = 0;

    Object.values(x.entries).forEach((x) => {
      if (x.item.type === "active") {
        left += x.value;
      } else {
        right += x.value;
      }
    });

    const difference = Math.abs(left - right);
    const type = left > right ? "passive" : "active";

    const closingBalance = (x.entries["SBK"] = {
      item: { name: "SBK", type },
      value: difference,
    });

    return { closingBalance, ...x };
  });
}
