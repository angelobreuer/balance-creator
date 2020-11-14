import { BrowserWindow } from "electron/main";

// Include CSS file
var halfmoon = require("halfmoon");

window.addEventListener("DOMContentLoaded", () => {
  halfmoon.onDOMContentLoaded();
  halfmoon.toggleDarkMode();
});
