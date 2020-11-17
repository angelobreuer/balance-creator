import { BalanceItem, BalanceItemCategory, resolveRef } from "../balanceSheet";
import createModal from "../util/modalHelper";
import { storage } from "../storage";
import { showPage } from "./navigator";
import Page from "./page";
import createButton from "../util/buttonHelper";
import { notifyChange } from "../util/changesHelper";
import createSelect, { Option } from "../util/selectHelper";
import guid from "../util/guidHelper";

const modalItem: BalanceItem = {
  category: "fixed-assets",
  name: "",
  id: guid(),
};

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
      () => {
        // clone item data
        const data = { ...modalItem };
        storage.items.push(data);

        // reset item data
        modalItem.category = "fixed-assets";
        modalItem.name = "";
        modalItem.id = guid();

        notifyChange();

        // refresh page
        showPage(PostsPage);
      }
    );

    button.classList.add("mt-10");

    const elements = [
      createNameInput(modalItem),
      createCategorySelect(modalItem),
      button,
    ];

    element.appendChild(
      createModal(0, "Neuen Bilanzposten erstellen", elements)
    );
  },
};

function createCategorySelect(target: BalanceItem): HTMLSelectElement {
  const typeInput = createSelect(options, target.category, "mt-5");

  typeInput.addEventListener("change", () => {
    target.category = <BalanceItemCategory>typeInput.value;
    notifyChange();
  });

  return typeInput;
}

function render(item: BalanceItem): HTMLDivElement {
  const content = document.createElement("div");
  content.className = "card content p-10";

  content.appendChild(createNameInput(item));
  content.appendChild(createCategorySelect(item));

  const deleteButton = createButton(
    "Posten löschen",
    "danger",
    undefined,
    () => {
      deletePost(item);
      notifyChange();
      showPage(PostsPage);
    }
  );

  deleteButton.classList.add("mt-5");
  content.appendChild(deleteButton);

  return content;
}

function deletePost(post: BalanceItem) {
  if (storage.sheet.stocks.some((x) => resolveRef(x.item) === post)) {
    alert(
      "Es gibt einen Bestand der von diesem Posten abhängen:\n• " +
        post.name +
        "\n\nBitte entfernen Sie diesen zuerst, bevor sie diesen Posten löschen."
    );

    return;
  }

  const dependentEntries = storage.sheet.entries.filter(
    (x) =>
      x.credit.some((j) => resolveRef(j.item) === post) ||
      x.debit.some((j) => resolveRef(j.item) === post)
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

  notifyChange();
}

function createNameInput(target: BalanceItem): HTMLInputElement {
  const nameInput = document.createElement("input");
  nameInput.className = "form-control";
  nameInput.value = target.name;
  nameInput.type = "text";

  nameInput.addEventListener("change", () => {
    target.name = nameInput.value;
    notifyChange();
  });

  return nameInput;
}

const options: Option[] = [
  {
    name: "Aktiv (Anlagevermögen)",
    value: "fixed-assets",
  },
  {
    name: "Aktiv (Umlaufvermögen)",
    value: "current-assets",
  },
  {
    name: "Passiv",
    value: "passive",
  },
];
