import { renderBalance } from "../balanceSheetRenderer";
import { createAccounts, createItemRef } from "../balanceSheet";
import { storage } from "../storage";
import Page from "./page";

export const ClosingBalancePage: Page = {
  title: "Schlussbilanz",
  icon: "align-center",
  class: "balance",
  render: (element): void => {
    const accounts = createAccounts(storage.sheet).filter((x) => x.entries.SBK);

    const stocks = accounts.map((x) => ({
      item: x.item,
      value: x.entries["SBK"].value,
    }));

    element.appendChild(renderBalance("Schlussbilanz", stocks));
  },
};
