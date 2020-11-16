import { addSidebarPage } from "./pages/navigator";
import { pages } from "./pages/pages";

// Include CSS file
var halfmoon = require("halfmoon");

window.addEventListener("DOMContentLoaded", () => {
  halfmoon.onDOMContentLoaded();
  pages.forEach(addSidebarPage);
});
