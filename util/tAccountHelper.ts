import NameBalancePair from "../balancePair";
import formatCurrency from "./currencyHelper";

export function showInformation(
  container: HTMLElement,
  text: string,
  color: string,
  iconName: string
) {
  const warningContainer = document.createElement("div");
  const warningText = document.createElement("span");
  const icon = document.createElement("i");

  warningContainer.className = "non-printable";
  warningContainer.style.color = color;
  warningContainer.style.paddingTop = "15px";

  warningText.innerText = text;
  warningText.style.padding = "5px";

  icon.className = "fa fa-" + iconName;

  warningContainer.appendChild(icon);
  warningContainer.appendChild(warningText);
  container.appendChild(warningContainer);
}

export function verifyAccount(
  container: HTMLElement,
  leftSum: number,
  rightSum: number,
  accounts: NameBalancePair[]
) {
  var hasAnyWarnings = false;

  if (leftSum !== rightSum) {
    showInformation(
      container,
      `Die Summen sind nicht wertegleich (${formatCurrency(
        leftSum
      )} ≠ ${formatCurrency(rightSum)}).`,
      "red",
      "bug"
    );

    hasAnyWarnings = true;
  }

  if (leftSum < 0 || rightSum < 0) {
    showInformation(
      container,
      "Eine Summe hat einen negativen Wert.",
      "red",
      "exclamation-circle"
    );

    hasAnyWarnings = true;
  }

  const failingAccount = accounts.find((x) => x.balance < 0);

  if (failingAccount) {
    showInformation(
      container,
      `Der Posten ${
        failingAccount.name
      } hat einen negativen Wert (${formatCurrency(failingAccount.balance)}).`,
      "red",
      "exclamation-circle"
    );

    hasAnyWarnings = true;
  }

  if (!hasAnyWarnings) {
    showInformation(container, "Keine Fehler gefunden.", "green", "check");
  }
}
