export function requireElement<ElementType extends Element>(
  root: ParentNode,
  selector: string,
  constructor: abstract new (...arguments_: never[]) => ElementType,
): ElementType {
  const element = root.querySelector(selector);
  if (element instanceof constructor) return element;
  throw new Error(`Required element not found: ${selector}`);
}

export function setText(root: ParentNode, selector: string, value: string): void {
  const element = root.querySelector(selector);
  if (element instanceof HTMLElement) element.textContent = value;
}
