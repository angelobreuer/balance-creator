export default function createButton(
  content: string | HTMLElement,
  style: string,
  href?: string,
  callback?: (this: HTMLDivElement, ev: MouseEvent) => any
): HTMLDivElement {
  const buttonWrapper = document.createElement("div");
  const button = document.createElement("a");

  buttonWrapper.className = "text-right";
  buttonWrapper.appendChild(button);
  button.className = "btn btn-" + style;

  if (typeof content === "string") {
    button.text = content;
  } else {
    button.appendChild(content);
  }

  if (href) {
    button.href = href;
  }

  if (callback) {
    button.addEventListener("click", callback);
  }

  return buttonWrapper;
}

export function createIconButton(
  text: string,
  icon: string,
  style: string,
  href?: string,
  callback?: (this: HTMLDivElement, ev: MouseEvent) => any
) {
  const wrapper = document.createElement("span");
  const textElement = document.createElement("span");
  const iconElement = document.createElement("i");

  iconElement.className = "fa fa-" + icon;
  textElement.textContent = text;

  wrapper.appendChild(textElement);
  wrapper.appendChild(iconElement);

  return createButton(wrapper, style, href, callback);
}

export function createDisabledButton(
  content: string | HTMLElement,
  style?: string
): HTMLDivElement {
  return createButton(content, "muted " + style);
}