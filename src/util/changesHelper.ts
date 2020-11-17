import { remote } from "electron";
import { updateTitle } from "../pages/navigator";
var changes = false;

export function notifyChange() {
  changes = true;
  updateTitle();
}

export function notifySave() {
  changes = false;
  updateTitle();
}

export function hasChanges(): boolean {
  return changes;
}

export function askToDiscardChanges(
  title: string = "Ungespeicherte Änderungen",
  message: string = "Sie haben ungespeicherte Änderungen. Wollen Sie das Programm wirklich verlassen?",
  discardButton: string = "Verlassen"
): boolean {
  if (!hasChanges()) {
    return true;
  }

  const result = remote.dialog.showMessageBoxSync(
    remote.BrowserWindow.getFocusedWindow(),
    {
      type: "question",
      message,
      title,
      buttons: [discardButton, "Abbrechen"],
    }
  );

  return result == 0;
}
