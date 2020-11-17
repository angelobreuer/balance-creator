import { resolveRef } from "../balanceSheet";
import { renderBalance } from "../balanceSheetRenderer";
import { storage } from "../storage";
import Page from "./page";

export const OpeningBalancePage: Page = {
  title: "Eröffnungsbilanz",
  icon: "align-center",
  class: "balance",
  render: (element): void => {
    const stocks = storage.sheet.stocks.map((x) => ({
      item: resolveRef(x.item),
      value: x.value,
    }));

    element.appendChild(renderBalance("Eröffnungsbilanz", stocks));
  },
};
