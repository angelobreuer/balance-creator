"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var navigator_1 = require("./pages/navigator");
var pages_1 = require("./pages/pages");
// Include CSS file
var halfmoon = require("halfmoon");
window.addEventListener("DOMContentLoaded", function () {
    halfmoon.onDOMContentLoaded();
    pages_1.pages.forEach(navigator_1.addSidebarPage);
});
//# sourceMappingURL=preload.js.map