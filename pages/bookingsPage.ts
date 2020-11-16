import { BalanceSheetEntry } from "../balanceSheet";
import formatCurrency from "../util/currencyHelper";
import { storage } from "../storage";
import Page from "./page";

export const BookingsPage: Page = {
  title: "Buchungssätze",
  icon: "list",
  class: "bookings",
  render: (element): void => {
    storage.sheet.entries.forEach((x, i) =>
      element.appendChild(createBooking(x, i))
    );
  },
};

function createBooking(
  booking: BalanceSheetEntry,
  index: number
): HTMLDivElement {
  const container = document.createElement("div");
  const table = document.createElement("table");
  const description = document.createElement("span");

  container.style.marginTop = "30px";
  description.innerText = `${index + 1}) ${booking.description}`;

  const count = Math.max(booking.credit.length, booking.debit.length);

  for (let index = 0; index < count; index++) {
    const row = document.createElement("tr");
    const debitCell = document.createElement("td");
    const spacerCell = document.createElement("td");
    const creditCell = document.createElement("td");

    if (index === 0) {
      spacerCell.innerText = "an";
    }

    if (index < booking.debit.length) {
      const info = booking.debit[index];
      debitCell.innerText = `${info.item.name} ${formatCurrency(info.value)}`;
    }

    if (index < booking.credit.length) {
      const info = booking.credit[index];
      creditCell.innerText = `${info.item.name} ${formatCurrency(info.value)}`;
    }

    row.appendChild(debitCell);
    row.appendChild(spacerCell);
    row.appendChild(creditCell);
    table.appendChild(row);
  }

  container.appendChild(description);
  container.appendChild(table);

  return container;
}
