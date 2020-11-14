"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function formatCurrency(value) {
    return value.toLocaleString(undefined, {
        currency: "EUR",
        style: "currency",
        currencyDisplay: "code",
    });
}
exports.default = formatCurrency;
//# sourceMappingURL=currencyHelper.js.map