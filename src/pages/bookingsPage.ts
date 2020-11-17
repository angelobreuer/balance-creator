import { BalanceSheetEntry } from "../balanceSheet";
import formatCurrency from "../util/currencyHelper";
import { storage } from "../storage";
import Page from "./page";
import { createIconButton } from "../util/buttonHelper";
import { notifyChange } from "../util/changesHelper";
import { showPage } from "./navigator";

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
  const actions = document.createElement("div");

  description.className = booking.ignore
    ? "card-title text-muted"
    : "card-title";

  container.className = "card mt-30";
  table.className = "card-content";
  actions.className = "card-actions p-5";

  const deleteButton = createIconButton("", "trash", "text-red", "#", (x) => {
    storage.sheet.entries.splice(index);
    notifyChange();
  });

  const editButton = createIconButton("", "pen", "", "#", (x) => {});

  const hideButton = createIconButton(
    "",
    booking.ignore ? "eye-slash" : "eye",
    "",
    "#",
    (x) => {
      booking.ignore = !booking.ignore;
      notifyChange();
      showPage(BookingsPage);
    }
  );

  deleteButton.className = "float-left";
  editButton.className = "float-left ml-10";
  hideButton.className = "float-left ml-10";

  actions.appendChild(deleteButton);
  actions.appendChild(editButton);
  actions.appendChild(hideButton);

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
      debitCell.innerText = `${info.item.ref} ${formatCurrency(info.value)}`;
      debitCell.className = "booking-info";
    }

    if (index < booking.credit.length) {
      const info = booking.credit[index];
      creditCell.innerText = `${info.item.ref} ${formatCurrency(info.value)}`;
      creditCell.className = "booking-info";
    }

    row.appendChild(debitCell);
    row.appendChild(spacerCell);
    row.appendChild(creditCell);
    table.appendChild(row);
  }

  container.appendChild(actions);
  container.appendChild(description);
  container.appendChild(table);

  return container;
}
