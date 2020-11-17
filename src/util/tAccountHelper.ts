import NameBalancePair from "../balancePair";
import formatCurrency from "./currencyHelper";
import showInformation from "./errorHelper";

export function verifyAccount(
  container: HTMLElement,
  leftSum: number,
  rightSum: number,
  accounts: NameBalancePair[]
) {
  var hasAnyWarnings = false;

  if (leftSum !== rightSum) {
    container.appendChild(
      showInformation(
        `Die Summen sind nicht wertegleich (${formatCurrency(
          leftSum
        )} ≠ ${formatCurrency(rightSum)}).`,
        "red",
        "bug"
      )
    );

    hasAnyWarnings = true;
  }

  if (leftSum < 0 || rightSum < 0) {
    container.appendChild(
      showInformation(
        "Eine Summe hat einen negativen Wert.",
        "red",
        "exclamation-circle"
      )
    );

    hasAnyWarnings = true;
  }

  const failingAccount = accounts.find((x) => x.balance < 0);

  if (failingAccount) {
    container.appendChild(
      showInformation(
        `Der Posten ${
          failingAccount.name
        } hat einen negativen Wert (${formatCurrency(
          failingAccount.balance
        )}).`,
        "red",
        "exclamation-circle"
      )
    );

    hasAnyWarnings = true;
  }

  if (!hasAnyWarnings) {
    container.appendChild(
      showInformation("Keine Fehler gefunden.", "green", "check")
    );
  }
}
