export default function createModal(
  id: number,
  title: string,
  elements: HTMLElement[]
): HTMLDivElement {
  const modalWrapper = document.createElement("div");
  modalWrapper.className = "modal";
  modalWrapper.id = "modal-" + id;
  modalWrapper.tabIndex = -1;

  const modal = document.createElement("div");
  modalWrapper.appendChild(modal);
  modal.className = "modal-dialog";

  const modalContent = document.createElement("div");
  modal.appendChild(modalContent);
  modalContent.className = "modal-content";

  const modalTitle = document.createElement("h5");
  modalContent.appendChild(modalTitle);
  modalTitle.className = "modal-title";
  modalTitle.innerText = title;

  elements.forEach((x) => modalContent.appendChild(x));

  return modalWrapper;
}
