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
    buttonWrapper.appendChild(content);
  }

  if (href) {
    button.href = href;
  }

  if (callback) {
    buttonWrapper.addEventListener("click", callback);
  }

  return buttonWrapper;
}
