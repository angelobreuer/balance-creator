import {
  BalanceItem,
  BalanceItemCategory,
  BalanceSheetEntry,
  BalanceStock,
} from "../balanceSheet";
import createModal from "../util/modalHelper";
import { storage } from "../storage";
import { showPage } from "./navigator";
import Page from "./page";
import createButton from "../util/buttonHelper";

const modalItem: BalanceItem = { category: "fixed-assets", name: "" };

export const PostsPage: Page = {
  title: "Postenverwaltung",
  icon: "boxes",
  class: "posts",
  render: (element): void => {
    storage.items.forEach((x) => element.appendChild(render(x)));

    element.appendChild(
      createButton("Neuen Posten erstellen", "primary", "#modal-0")
    );
  },
  createModals: (element): void => {
    const button = createButton(
      "Posten erstellen",
      "primary",
      undefined,
      (x) => {
        // clone item data
        const data = { ...modalItem };
        storage.items.push(data);

        // reset item data
        modalItem.category = "fixed-assets";
        modalItem.name = "";

        // refresh page
        showPage(PostsPage);
      }
    );

    button.classList.add("mt-10");

    const elements = [
      createNameInput(modalItem),
      createSelect(modalItem),
      button,
    ];

    element.appendChild(
      createModal(0, "Neuen Bilanzposten erstellen", elements)
    );
  },
};

function render(item: BalanceItem): HTMLDivElement {
  const content = document.createElement("div");
  content.className = "card content p-10";

  content.appendChild(createNameInput(item));
  content.appendChild(createSelect(item));

  const deleteButton = createButton(
    "Posten löschen",
    "danger",
    undefined,
    (x) => {
      deletePost(item);
      showPage(PostsPage);
    }
  );

  deleteButton.classList.add("mt-10");
  content.appendChild(deleteButton);

  return content;
}

function deletePost(post: BalanceItem) {
  if (storage.sheet.stocks.some((x) => x.item === post)) {
    alert(
      "Es gibt einen Bestand der von diesem Posten abhängen:\n• " +
        post.name +
        "\n\nBitte entfernen Sie diesen zuerst, bevor sie diesen Posten löschen."
    );

    return;
  }

  const dependentEntries = storage.sheet.entries.filter(
    (x) =>
      x.credit.some((j) => j.item === post) ||
      x.debit.some((j) => j.item === post)
  );

  if (dependentEntries.length > 0) {
    alert(
      "Es gibt Buchungen die von diesem Posten abhängen:\n" +
        dependentEntries.map((x) => `• ${x.description}`).join("\n") +
        "\n\nBitte entfernen Sie diese zuerst, bevor sie diesen Posten löschen."
    );

    return;
  }

  storage.items = storage.items.filter((x) => x !== post);
}

function createNameInput(target: BalanceItem): HTMLInputElement {
  const nameInput = document.createElement("input");
  nameInput.className = "form-control";
  nameInput.value = target.name;
  nameInput.addEventListener("change", (x) => (target.name = nameInput.value));
  return nameInput;
}

function createSelect(target: BalanceItem): HTMLSelectElement {
  const typeInput = document.createElement("select");
  typeInput.className = "form-control mt-5";
  typeInput.value = target.category;

  typeInput.addEventListener(
    "change",
    (x) => (target.category = <BalanceItemCategory>typeInput.value)
  );

  createOptionSet().forEach((x) => typeInput.appendChild(x));
  return typeInput;
}

function createOptionSet(): HTMLOptionElement[] {
  const options: HTMLOptionElement[] = [];

  const option1 = document.createElement("option");
  option1.text = "Aktiv (Anlagevermögen)";
  option1.value = "fixed-assets";
  options.push(option1);

  const option2 = document.createElement("option");
  option2.text = "Aktiv (Umlaufvermögen)";
  option2.value = "current-assets";
  options.push(option2);

  const option3 = document.createElement("option");
  option3.text = "Passiv";
  option3.value = "passive";
  options.push(option3);

  return options;
}
