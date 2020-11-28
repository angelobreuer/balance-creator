import { notifyChange } from "../util/changesHelper";
import { storage } from "../storage";
import { showPage } from "./navigator";
import Page from "./page";
import {
  BalanceItem,
  BalanceStock,
  createItemRef,
  isInventoryItem,
  resolveRef,
} from "../balanceSheet";
import createModal from "../util/modalHelper";
import showInformation from "../util/errorHelper";
import { PostsPage } from "./postsPage";
import createSelect from "../util/selectHelper";

import {
  createDisabledIconButton,
  createIconButton,
} from "../util/buttonHelper";

function getAvailableItems(): BalanceItem[] {
  return storage.items.filter((x) => !isInventoryItem(x.category));
}

export const StocksPage: Page = {
  title: "Bestände",
  icon: "receipt",
  class: "stocks",
  render: (element): void => {
    const hasItems = getAvailableItems().length > 0;

    if (hasItems) {
      const table = document.createElement("table");
      element.appendChild(table);
      storage.sheet.stocks.forEach((x, i) => table.appendChild(render(x, i)));

      const hasRemainingStocks = getAvailableItems().some(
        (x) => !storage.sheet.stocks.some((j) => resolveRef(j.item) === x)
      );

      if (hasRemainingStocks) {
        element.appendChild(
          createIconButton(
            "Neuen Bestand aufnehmen",
            "plus",
            "primary",
            "#modal-0",
            undefined,
            "right mt-10"
          )
        );
      } else {
        element.appendChild(
          createDisabledIconButton(
            "Neuen Bestand aufnehmen",
            "plus",
            "float-right",
            "right mt-10"
          )
        );
      }
    } else {
      element.appendChild(
        showInformation(
          "Bevor Bestände angelegt werden können, müssen Sie Posten anlegen.",
          "red",
          "bug",
          15,
          25
        )
      );

      element.appendChild(
        createDisabledIconButton(
          "Neuen Bestand aufnehmen",
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
          () => {
            showPage(PostsPage);
          }
        )
      );
    }
  },
  createModals(root) {
    const remainingItems = getAvailableItems().filter(
      (x) => !storage.sheet.stocks.some((j) => resolveRef(j.item) === x)
    );

    if (remainingItems.length <= 0) {
      return;
    }

    const options = remainingItems.map((x) => ({
      name: x.name,
      value: x.name,
    }));

    const valueWrapper = document.createElement("div");
    const value = document.createElement("input");
    const currency = document.createElement("span");

    valueWrapper.appendChild(value);
    valueWrapper.appendChild(currency);

    valueWrapper.className = "mt-10 form-inline";
    value.value = (0).toFixed(2);
    value.className = "form-control float-left text-right";
    value.type = "number";
    currency.textContent = "EUR";
    currency.className = "float-left";

    const select = createSelect(options);

    const button = createIconButton(
      "Hinzufügen",
      "plus",
      "primary mt-10",
      "#",
      () => {
        const target = getAvailableItems().find((x) => x.name === select.value);

        storage.sheet.stocks.push({
          item: createItemRef(target),
          value: value.valueAsNumber,
        });

        notifyChange();
        showPage(StocksPage);
      }
    );

    const elements: HTMLElement[] = [select, valueWrapper, button];
    root.appendChild(createModal(0, "Bestand aufnehmen", elements));
  },
};

function render(stock: BalanceStock, index: number) {
  const row = document.createElement("tr");
  const item = resolveRef(stock.item);

  const name = document.createElement("td");
  row.appendChild(name);
  name.innerText = item.name;

  const value = document.createElement("td");
  row.appendChild(value);
  value.className = "form-group";

  const input = document.createElement("input");
  value.appendChild(input);
  input.type = "number";
  input.value = stock.value.toFixed(2);
  input.className = "form-control text-right";

  input.addEventListener("change", (event) => {
    const target = <HTMLInputElement>event.target;
    stock.value = target.valueAsNumber;
  });

  const unit = document.createElement("td");
  row.appendChild(unit);
  unit.innerText = "EUR";

  const buttonsColumn = document.createElement("td");
  buttonsColumn.className = "d-flex float-right";

  const deleteButton = createIconButton(
    "",
    "trash text-red",
    "float-left",
    "#",
    () => {
      storage.sheet.stocks = storage.sheet.stocks.filter(
        (j) => j.item !== stock.item
      );

      showPage(StocksPage);
      notifyChange();
    }
  );
  buttonsColumn.appendChild(deleteButton);

  row.appendChild(buttonsColumn);
  return row;
}
