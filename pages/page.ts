export default interface Page {
  title: string;
  class: string;
  icon: string;
  render(root: HTMLElement): void;
  createModals?(root: HTMLElement): void;
}
