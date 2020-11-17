export interface Option {
  name: string;
  value: string;
}

export function createOptionSet(options: Option[]): HTMLOptionElement[] {
  const elements: HTMLOptionElement[] = [];

  options.forEach((x) => {
    const option = document.createElement("option");
    option.text = x.name;
    option.value = x.value;
    elements.push(option);
  });

  return elements;
}

export default function createSelect(
  options: Option[],
  selected?: Option | string,
  style: string = ""
): HTMLSelectElement {
  const select = document.createElement("select");
  createOptionSet(options).forEach((x) => select.appendChild(x));

  select.className = "form-control " + style;

  if (typeof selected === "string") {
    select.value = selected;
  } else {
    select.value = (selected || options[0]).value;
  }

  return select;
}
