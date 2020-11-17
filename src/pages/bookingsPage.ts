import { BalanceSheetEntry, BalanceStock, resolveRef } from "../balanceSheet";
import formatCurrency from "../util/currencyHelper";
import { storage } from "../storage";
import Page from "./page";
import { notifyChange } from "../util/changesHelper";
import { showPage } from "./navigator";
import createModal from "../util/modalHelper";
import createSelect, { Option } from "../util/selectHelper";
import showInformation from "../util/errorHelper";
import { PostsPage } from "./postsPage";
import guid from "../util/guidHelper";

import {
  createDisabledIconButton,
  createIconButton,
} from "../util/buttonHelper";

var modal: BookingsModal;

export const BookingsPage: Page = {
  title: "Buchungssätze",
  icon: "list",
  class: "bookings",
  render: (element): void => {
    storage.sheet.entries.forEach((x, i) =>
      element.appendChild(createBooking(x, i))
    );

    if (storage.items.length <= 0) {
      const error = showInformation(
        "Bevor Buchungssätze erstellt werden können, müssen Sie Posten anlegen.",
        "red",
        "bug",
        15,
        25
      );

      element.appendChild(error);

      element.appendChild(
        createDisabledIconButton(
          "Neuer Buchungssatz",
          "plus",
          "float-right ml-10"
        )
      );

      element.appendChild(
        createIconButton(
          "Zur Postenverwaltung",
          "external-link-alt",
          "secondary float-right",
          "#",
          () => showPage(PostsPage)
        )
      );
    } else {
      element.appendChild(
        createIconButton("Neuer Buchungssatz", "plus", "primary", "#modal-0")
      );
    }
  },
  createModals(element) {
    modal = new BookingsModal(
      element,
      {
        credit: [
          {
            item: resolveRef(storage.items[0]),
            value: 0,
          },
        ],
        debit: [
          {
            item: resolveRef(storage.items[0]),
            value: 0,
          },
        ],
      },
      true
    );
  },
};

class BookingsModal {
  readonly booking: BalanceSheetEntry;
  readonly isNew: boolean;
  content: HTMLElement;

  constructor(
    element: HTMLElement,
    booking: BalanceSheetEntry,
    isNew: boolean
  ) {
    this.isNew = isNew;
    this.content = document.createElement("div");
    this.booking = booking;
    this.render();

    const modal = createModal(0, "Buchungssatz erstellen", [this.content]);
    element.appendChild(modal);
  }

  render() {
    if (storage.items.length <= 0) {
      this.content.innerHTML = "";
      return;
    }

    const descriptionArea = document.createElement("textarea");
    descriptionArea.className = "form-control mb-20";

    if (this.booking.description) {
      descriptionArea.value = this.booking.description;
    }

    descriptionArea.placeholder =
      "Hier können Sie eine Beschreibung für diesen Buchungssatz festlegen." +
      "\nDieser Buchungssatz wird unter der Buchungssätze-Seite angezeigt.";

    descriptionArea.addEventListener("change", () => {
      this.booking.description = descriptionArea.value;
    });

    const description = document.createElement("h5");
    description.textContent = "Beschreibung";

    const debit = this.createBookingSide("Soll", this.booking.debit, true);
    const credit = this.createBookingSide("Haben", this.booking.credit, false);

    const ignoreCheckboxWrapper = document.createElement("div");
    const ignoreCheckboxLabel = document.createElement("label");
    const ignoreCheckbox = document.createElement("input");
    const ignoreCheckboxId = guid();

    ignoreCheckboxWrapper.className = "custom-checkbox";

    ignoreCheckboxLabel.htmlFor = ignoreCheckboxId;
    ignoreCheckboxLabel.textContent =
      "Buchungssatz in Berechnung nicht einbeziehen";

    ignoreCheckbox.value = "";
    ignoreCheckbox.checked = this.booking.ignore || false;
    ignoreCheckbox.type = "checkbox";
    ignoreCheckbox.className = "mt-10 form-control";
    ignoreCheckbox.id = ignoreCheckboxId;

    ignoreCheckboxWrapper.appendChild(ignoreCheckbox);
    ignoreCheckboxWrapper.appendChild(ignoreCheckboxLabel);

    ignoreCheckbox.addEventListener("change", () => {
      this.booking.ignore = ignoreCheckbox.checked;
    });

    const addButton = createIconButton(
      this.isNew ? "Buchungssatz erstellen" : "Buchungssatz aktualisieren",
      this.isNew ? "plus" : "pen",
      "primary w-full",
      "#",
      () => {
        // fix description
        if (!this.booking.description) {
          this.booking.description = "Keine Beschreibung verfügbar.";
        }

        if (this.isNew) {
          storage.sheet.entries.push(this.booking);
        }

        showPage(BookingsPage);
        notifyChange();
      },
      "center w-full mt-10 form-group"
    );

    this.content.innerHTML = "";

    [
      description,
      descriptionArea,
      debit,
      credit,
      ignoreCheckboxWrapper,
      addButton,
    ].forEach((x) => this.content.appendChild(x));
  }

  createBookingSide(
    name: string,
    stocks: BalanceStock[],
    isDebit: boolean
  ): HTMLDivElement {
    const options: Option[] = storage.items.map((x) => ({
      name: x.name,
      value: x.id,
    }));

    const wrapper = document.createElement("div");
    const title = document.createElement("h5");
    const content = document.createElement("div");

    wrapper.className = "m-0 mb-20";
    content.className = "p-5 m-0 mt-5";
    title.textContent = "Buchungen im " + name;

    wrapper.appendChild(title);
    wrapper.appendChild(content);

    const addButton = createIconButton(
      `Neue ${name}-Buchung hinzufügen`,
      "plus",
      "primary w-full",
      "#modal-0",
      () => {
        const stock: BalanceStock = { item: storage.items[0], value: 0 };
        stocks.push(stock);
        this.render();
      },
      "center w-full mt-10 form-group"
    );

    const canBeDeleted = stocks.length > 1;

    stocks.forEach((x) =>
      content.appendChild(
        this.createBookingSideEntry(x, options, isDebit, canBeDeleted)
      )
    );

    content.appendChild(addButton);
    return wrapper;
  }

  createBookingSideEntry(
    stock: BalanceStock,
    options: Option[],
    isDebit: boolean,
    canBeDeleted: boolean
  ): HTMLDivElement {
    const wrapper = document.createElement("div");
    const value = document.createElement("input");
    const select = createSelect(options, stock.item.id);
    const currency = document.createElement("span");

    select.addEventListener("change", () => {
      stock.item = { id: select.value };
    });

    value.addEventListener("change", () => {
      stock.value = value.valueAsNumber;
    });

    const deleteButton = createIconButton(
      "",
      "trash",
      canBeDeleted ? "danger text-center" : "muted text-center",
      "#modal-0",
      () => {
        if (!canBeDeleted) {
          return;
        }

        if (isDebit) {
          this.booking.debit = this.booking.debit.filter((x) => x !== stock);
        } else {
          this.booking.credit = this.booking.credit.filter((x) => x !== stock);
        }

        this.render();
      }
    );

    wrapper.className = "form-inline mt-5";
    value.type = "number";
    value.className = "text-right form-control";
    value.value = stock.value.toFixed(2);
    currency.textContent = "EUR";
    currency.className = "text-right mr-10";

    wrapper.appendChild(select);
    wrapper.appendChild(value);
    wrapper.appendChild(currency);
    wrapper.appendChild(deleteButton);

    return wrapper;
  }
}

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

  const deleteButton = createIconButton("", "trash", "text-red", "#", () => {
    storage.sheet.entries.splice(index, 1);
    showPage(BookingsPage);
    notifyChange();
  });

  const editButton = createIconButton("", "pen", "", "#modal-0", () => {
    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = "";
    modal = new BookingsModal(modalContainer, booking, false);
  });

  const hideButton = createIconButton(
    "",
    booking.ignore ? "eye-slash" : "eye",
    "",
    "#",
    () => {
      booking.ignore = !booking.ignore;
      notifyChange();
      showPage(BookingsPage);
    }
  );

  const moveUpButton = createIconButton("", "arrow-up", "", "#", () => {
    moveBooking(index, -1);
  });

  const moveDownButton = createIconButton("", "arrow-down", "", "#", () => {
    moveBooking(index, 1);
  });

  moveUpButton.className = "float-left";
  deleteButton.className = "float-left ml-10";
  moveDownButton.className = "float-left ml-10";
  editButton.className = "float-left ml-10";
  hideButton.className = "float-left ml-10";

  actions.appendChild(moveUpButton);
  actions.appendChild(moveDownButton);
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
      debitCell.className = "booking-info";

      debitCell.innerText = `${resolveRef(info.item).name} ${formatCurrency(
        info.value
      )}`;
    }

    if (index < booking.credit.length) {
      const info = booking.credit[index];
      creditCell.className = "booking-info";

      creditCell.innerText = `${resolveRef(info.item).name} ${formatCurrency(
        info.value
      )}`;
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

function moveBooking(currentIndex: number, direction: number) {
  const arr = storage.sheet.entries;

  if (currentIndex + direction < 0 || currentIndex + direction >= arr.length) {
    return;
  }

  var element = arr[currentIndex];
  arr.splice(currentIndex, 1);
  arr.splice(currentIndex + direction, 0, element);

  showPage(BookingsPage);
  notifyChange();
}
