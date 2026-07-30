import bodyMarkup from "./body.html?raw";
import runtime from "./main.js?raw";

document.body.innerHTML = bodyMarkup;

const runtimeScript = document.createElement("script");
runtimeScript.textContent = runtime;
document.body.append(runtimeScript);
