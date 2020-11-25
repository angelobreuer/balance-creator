export default function createButton(
  content: string | HTMLElement,
  style: string,
  href?: string,
  callback?: (this: HTMLDivElement, ev: MouseEvent) => any,
  align: string = "right"
): HTMLDivElement {
  const buttonWrapper = document.createElement("div");
  const button = document.createElement("a");

  buttonWrapper.className = "text-" + align;

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
  callback?: (this: HTMLDivElement, ev: MouseEvent) => any,
  align: string = "right"
) {
  const wrapper = document.createElement("span");
  const textElement = document.createElement("span");
  const iconElement = document.createElement("i");

  textElement.textContent = text;
  textElement.className = "ml-5";
  iconElement.className = "fa fa-" + icon;

  wrapper.appendChild(iconElement);
  wrapper.appendChild(textElement);

  return createButton(wrapper, style, href, callback, align);
}

export function createDisabledButton(
  content: string | HTMLElement,
  style?: string,
  align: string = "right"
): HTMLDivElement {
  return createButton(content, "muted " + style, align);
}

export function createDisabledIconButton(
  content: string,
  icon: string,
  style?: string,
  align: string = "right"
): HTMLDivElement {
  return createIconButton(
    content,
    icon,
    "muted " + style,
    undefined,
    undefined,
    align
  );
}
