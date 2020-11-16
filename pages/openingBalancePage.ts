import { renderBalance } from "../balanceSheetRenderer";
import { storage } from "../storage";
import Page from "./page";

export const OpeningBalancePage: Page = {
  title: "Eröffnungsbilanz",
  icon: "align-center",
  class: "balance",
  render: (element): void => {
    element.appendChild(
      renderBalance("Eröffnungsbilanz", storage.sheet.stocks)
    );
  },
};
