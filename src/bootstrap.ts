import { bodyPart1Markup } from "./body/part-1";
import { bodyPart2Markup } from "./body/part-2";
import { bodyPart3Markup } from "./body/part-3";
import { installLegacyRuntimeGlobals } from "./runtime-compat";
import runtime from "./main.js?raw";

const bodyMarkup = [bodyPart1Markup, bodyPart2Markup, bodyPart3Markup].join("");

document.body.innerHTML = bodyMarkup;
installLegacyRuntimeGlobals();

const runtimeScript = document.createElement("script");
runtimeScript.textContent = runtime;
document.body.append(runtimeScript);
