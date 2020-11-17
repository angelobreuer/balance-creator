import { renderSheet } from "../accountRenderer";
import { createAccounts } from "../balanceSheet";
import { storage } from "../storage";
import Page from "./page";

export const AccountsPage: Page = {
  title: "Bilanzkonten",
  icon: "stream",
  class: "accounts",
  render: (element): void => {
    const accounts = createAccounts(storage.sheet);
    element.appendChild(renderSheet(accounts));
  },
};
