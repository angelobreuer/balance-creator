import { remote } from "electron";
import { readFileSync, writeFile } from "fs";
import { addSidebarPage, showPage } from "./pages/navigator";
import { storage, updateData } from "./storage";
import { pages } from "./pages/pages";
import { PostsPage } from "./pages/postsPage";
import { askToDiscardChanges, notifySave } from "./util/changesHelper";
import exportHTML, { defaultExportOptions } from "./util/exportHelper";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

import halfmoonCss from "./css/halfmoon.min.css";
import mainCss from "./css/main.css";

var halfmoon = require("halfmoon");

const focusedWindow = remote.BrowserWindow.getFocusedWindow();

window.addEventListener("beforeunload", (e) => {
  const shouldDiscard = askToDiscardChanges(
    "Ungespeicherte Änderungen",
    "Es sind ungespeicherte Änderungen vorhanden. Wenn Sie das Program schließen gehen diese verloren.",
    "Verlassen"
  );

  if (!shouldDiscard) {
    e.returnValue = ""; // prevent window close
    e.preventDefault();
  }
});

function addStylesheet(path: string) {
  const elem = document.createElement("link");
  elem.rel = "stylesheet";
  elem.href = path;
  document.head.appendChild(elem);
}

addStylesheet(halfmoonCss);
addStylesheet(mainCss);

halfmoon.onDOMContentLoaded();
pages.forEach(addSidebarPage);

document
  .getElementById("sticky-dark-toggler")
  .addEventListener("click", function () {
    halfmoon.toggleDarkMode();
  });

document.getElementById("print-button").addEventListener("click", function () {
  var printer = require("print-html-element");
  printer.printElement(document.getElementById("content-wrapper"));
});

document.getElementById("new-button").addEventListener("click", function () {
  const shouldDiscard = askToDiscardChanges(
    "Ungespeicherte Änderungen",
    "Es sind ungespeicherte Änderungen vorhanden. Wenn Sie eine neue Datei erstellen, gehen aktuelle Änderungen verloren.",
    "Weiter"
  );

  if (!shouldDiscard) {
    return;
  }

  updateData({ items: [], sheet: { entries: [], stocks: [] } });
  showPage(PostsPage);
});

document.getElementById("save-button").addEventListener("click", function () {
  const result = remote.dialog.showSaveDialogSync(focusedWindow, {
    filters: [{ extensions: ["bew"], name: "BEW-Dateien" }],
  });

  if (!result) {
    return;
  }

  const data = JSON.stringify(storage, null, 2);
  writeFile(result, data, () => {});
  notifySave();
});

document.getElementById("export-button").addEventListener("click", function () {
  exportHTML(defaultExportOptions);
});

document.getElementById("open-button").addEventListener("click", function () {
  const allowDiscard = askToDiscardChanges(
    "Ungespeicherte Änderungen",
    "Wenn Sie ein neues Dokument öffnen, gehen ungespeicherte Änderungen verloren. Wollen Sie wirklich fortfahren?",
    "Fortfahren"
  );

  if (!allowDiscard) {
    return;
  }

  const result = remote.dialog.showOpenDialogSync(focusedWindow, {
    filters: [{ extensions: ["bew"], name: "BEW-Dateien" }],
  });

  if (!result) {
    return;
  }

  const content = readFileSync(result[0]);
  updateData(JSON.parse(content.toString("utf8")));
  showPage(PostsPage);
});

showPage(PostsPage);
