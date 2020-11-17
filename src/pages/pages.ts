import { AccountsPage } from "./accountsPage";
import { ClosingBalancePage } from "./closingBalancePage";
import Page from "./page";
import { BookingsPage } from "./bookingsPage";
import { OpeningBalancePage } from "./openingBalancePage";
import { StocksPage } from "./stocksPage";
import { PostsPage } from "./postsPage";

export const pages: Page[] = [
  PostsPage,
  StocksPage,
  OpeningBalancePage,
  BookingsPage,
  AccountsPage,
  ClosingBalancePage,
];
