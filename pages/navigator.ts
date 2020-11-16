import Page from "./page";

export function addSidebarPage(page: Page) {
  const sidebar = document.getElementById("dynamic-sidebar");
  const root = document.createElement("a");
  const span = document.createElement("span");
  const icon = document.createElement("i");

  root.href = "#";

  root.className = "sidebar-link sidebar-link-with-icon";
  span.className = "sidebar-icon";
  icon.className = `fa fa-${page.icon}`;

  root.innerText = page.title;

  span.prepend(icon);
  root.prepend(span);

  root.addEventListener("click", () => showPage(page));

  sidebar.appendChild(root);
}

export function showPage(page: Page) {
  const element = document.getElementById("page-content");
  const modalContainer = document.getElementById("modal-container");

  element.innerHTML = "";
  modalContainer.innerHTML = "";

  document.title = `${page.title} - Bilanzenersteller`;

  const titleElement = document.createElement("h1");
  const contentElement = document.createElement("div");

  titleElement.innerText = page.title;
  page.render(contentElement);

  contentElement.classList.add(page.class);

  element.appendChild(titleElement);
  element.appendChild(contentElement);

  if (page.createModals) {
    page.createModals(modalContainer);
  }
}
