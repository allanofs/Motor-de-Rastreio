import {
  evaluateMamaProductDraft,
  presentMamaProduct,
  projectSharedSessionContextToMama,
  toMamaMotorModuleSnapshot,
} from "../../src/product/mama";
import {
  consumeMotorNavigationHandoff,
  encodeMotorModuleOutcomeReceipt,
} from "../../src/product/shell";
import { collectMamaPilotDraft } from "./pilotDraft";

const context = consumeMotorNavigationHandoff(window, "mama");
if (context !== undefined) {
  const projection = projectSharedSessionContextToMama(context);
  const asOf = document.getElementById("as-of");
  const age = document.getElementById("age");

  if (asOf instanceof HTMLInputElement && projection.asOf.status === "available") {
    asOf.value = projection.asOf.value;
    asOf.dataset.sharedSource = projection.asOf.source;
  }
  if (age instanceof HTMLInputElement && projection.ageYears.status === "derived") {
    age.value = String(projection.ageYears.value);
    age.dataset.sharedSources = projection.ageYears.sources.join(",");
  }
}

const resultRegion = document.getElementById("result-region");
if (resultRegion instanceof HTMLElement) {
  const returnBox = document.createElement("div");
  returnBox.className = "inline-actions";
  returnBox.dataset.motorReturn = "mama";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.textContent = "Voltar ao MOTOR";
  button.addEventListener("click", () => {
    const evaluated = evaluateMamaProductDraft(collectMamaPilotDraft());
    if (!evaluated.ok) return;
    const snapshot = toMamaMotorModuleSnapshot(presentMamaProduct(evaluated));
    window.name = encodeMotorModuleOutcomeReceipt(snapshot);
    window.location.assign("../shell/index.html");
  });
  returnBox.append(button);
  resultRegion.append(returnBox);
}
