export default function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    currency: "EUR",
    style: "currency",
    currencyDisplay: "code",
  });
}
