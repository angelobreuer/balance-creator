import { storage } from "../storage";
import createButton from "../util/buttonHelper";
import { showPage } from "./navigator";
import Page from "./page";

export const StocksPage: Page = {
  title: "Bestände",
  icon: "receipt",
  class: "stocks",
  render: (element): void => {
    const table = document.createElement("table");
    element.appendChild(table);

    storage.sheet.stocks.forEach((x) => {
      const row = document.createElement("tr");
      table.appendChild(row);

      const name = document.createElement("td");
      row.appendChild(name);
      name.innerText = x.item.name;

      const value = document.createElement("td");
      row.appendChild(value);
      value.className = "form-group";

      const input = document.createElement("input");
      value.appendChild(input);
      input.type = "number";
      input.value = x.value.toFixed(2);
      input.className = "form-control text-right";

      input.addEventListener("change", (event) => {
        const target = <HTMLInputElement>event.target;
        x.value = target.valueAsNumber;
      });

      const unit = document.createElement("td");
      row.appendChild(unit);
      unit.innerText = "EUR";

      const deleteButtonIcon = document.createElement("a");
      const deleteButtonColumn = document.createElement("td");

      deleteButtonIcon.style.color = "red";
      deleteButtonIcon.className = "fa fa-trash";

      deleteButtonColumn.addEventListener("click", () => {
        storage.sheet.stocks = storage.sheet.stocks.filter(
          (j) => j.item !== x.item
        );

        showPage(StocksPage);
      });

      deleteButtonColumn.appendChild(deleteButtonIcon);
      row.appendChild(deleteButtonColumn);
    });
  },
};
