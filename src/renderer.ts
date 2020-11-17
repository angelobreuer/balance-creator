import { remote } from "electron";
import { readFileSync, writeFile } from "fs";
import { addSidebarPage, showPage } from "./pages/navigator";
import { storage, updateData } from "./storage";
import { pages } from "./pages/pages";
import { PostsPage } from "./pages/postsPage";
import { askToDiscardChanges, notifySave } from "./util/changesHelper";
import exportSheet from "./util/exportHelper";

var halfmoon = require("halfmoon");

const focusedWindow = remote.BrowserWindow.getFocusedWindow();

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
  exportSheet();
});

document.getElementById("open-button").addEventListener("click", function () {
  if (
    !askToDiscardChanges(
      "Ungespeicherte Änderungen",
      "Wenn Sie ein neues Dokument öffnen, gehen ungespeicherte Änderungen verloren. Wollen Sie wirklich fortfahren?",
      "Fortfahren"
    )
  ) {
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