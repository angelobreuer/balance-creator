import guid from "../util/guidHelper";
import Page from "./page";
import exportHTML, { defaultExportOptions } from "../util/exportHelper";
import { createIconButton } from "../util/buttonHelper";

export const ExportPage: Page = {
  title: "Exportieren",
  icon: "file-export",
  class: "export",
  render: (element): void => {
    options.forEach((x) => element.appendChild(x));

    element.appendChild(
      createIconButton(
        "Als HTML exportieren",
        "file-code",
        "primary",
        "#",
        () => exportHTML(defaultExportOptions),
        "right mt-10"
      )
    );
  },
};
const options = [
  bindOption("Eröffnungsbilanz exportieren", "exportOpeningBalance"),
  bindOption("Konten exportieren", "exportAccounts"),
  bindOption("Schlussbilanz exportieren", "exportClosingBalance"),
  bindOption("Buchungssätze exportieren", "exportBookings"),
  bindOption("Schlussbilanzkonto exportieren", "exportClosingBalanceAccount"),
  bindOption("Bestände exportieren", "exportStocks"),
  bindOption("Posten exportieren", "exportPosts"),
];

function bindOption(name: string, key: string): HTMLDivElement {
  const checkboxWrapper = document.createElement("div");
  const checkboxLabel = document.createElement("label");
  const checkbox = document.createElement("input");
  const checkboxId = guid();
  const options = <{ [key: string]: boolean }>defaultExportOptions;

  checkboxWrapper.className = "custom-checkbox mt-10";

  checkboxLabel.htmlFor = checkboxId;
  checkboxLabel.textContent = name;

  checkbox.value = "";
  checkbox.checked = options[key];
  checkbox.type = "checkbox";
  checkbox.className = "mt-10 form-control";
  checkbox.id = checkboxId;

  checkboxWrapper.appendChild(checkbox);
  checkboxWrapper.appendChild(checkboxLabel);

  checkbox.addEventListener("change", () => (options[key] = checkbox.checked));

  return checkboxWrapper;
}
