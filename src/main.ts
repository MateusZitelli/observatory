import cssText from "./styles/index.css?inline";
import { mountApp } from "./runtime/app";

const style = document.createElement("style");
style.textContent = cssText;
document.head.append(style);

const root = document.querySelector<HTMLElement>("#app");
if (root === null) throw new Error("Application root is missing.");

const runtime = mountApp(root);
import.meta.hot?.dispose(() => {
  runtime.destroy();
  style.remove();
});