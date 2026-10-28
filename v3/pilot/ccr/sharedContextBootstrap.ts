import {
  evaluateCcrProductDraft,
  presentCcrProduct,
  projectSharedSessionContextToCcr,
  toCcrMotorModuleSnapshot,
} from "../../src/product/ccr";
import {
  consumeMotorNavigationHandoff,
  consumeMotorTabSessionModuleHandoff,
  createMotorEphemeralSessionLedger,
  encodeMotorTabJourneyShellReturn,
  encodeMotorTabSessionShellReturn,
} from "../../src/product/shell";
import { collectCcrPilotDraft } from "./pilotDraft";
import { pilotExams } from "./pilotExamState";

const tabSession = consumeMotorTabSessionModuleHandoff(window, "ccr");
const sessionLedger = tabSession?.ledger ?? createMotorEphemeralSessionLedger();
const context = tabSession?.context ?? consumeMotorNavigationHandoff(window, "ccr");

if (context !== undefined) {
  const projection = projectSharedSessionContextToCcr(context);
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

const resultState = document.getElementById("result-state");
if (resultState instanceof HTMLElement) {
  const returnBox = document.createElement("div");
  returnBox.className = "inline-actions";
  returnBox.dataset.motorReturn = "ccr";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.textContent = "Voltar ao MOTOR";
  button.addEventListener("click", () => {
    const evaluated = evaluateCcrProductDraft(collectCcrPilotDraft(pilotExams));
    if (!evaluated.ok) return;
    const snapshot = toCcrMotorModuleSnapshot(presentCcrProduct(evaluated));
    window.name = context === undefined
      ? encodeMotorTabSessionShellReturn(sessionLedger, snapshot)
      : encodeMotorTabJourneyShellReturn("ccr", context, sessionLedger, snapshot);
    window.location.assign("../shell/index.html");
  });
  returnBox.append(button);
  resultState.append(returnBox);
}
