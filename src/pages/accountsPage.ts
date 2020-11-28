import { renderAccounts } from "../accountRenderer";
import { createAccounts } from "../balanceSheet";
import { storage } from "../storage";
import Page from "./page";

export const AccountsPage: Page = {
  title: "Konten",
  icon: "stream",
  class: "accounts",
  render: (element): void => {
    const accounts = createAccounts(storage.sheet);
    element.appendChild(renderAccounts(accounts));
  },
};
