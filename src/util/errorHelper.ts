export default function showInformation(
  text: string,
  color: string,
  iconName: string
): HTMLDivElement {
  const container = document.createElement("div");
  const content = document.createElement("span");
  const icon = document.createElement("i");

  container.className = "non-printable";
  container.style.color = color;
  container.style.paddingTop = "15px";

  content.innerText = text;
  content.style.padding = "5px";

  icon.className = "fa fa-" + iconName;

  container.appendChild(icon);
  container.appendChild(content);
  return container;
}
