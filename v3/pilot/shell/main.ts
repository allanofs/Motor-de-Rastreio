import { MOTOR_MODULES } from "../../src/product/shell";
import {
  createMotorSharedSessionContext,
  knownMotorSharedFact,
  motorIsoDate,
  unknownMotorSharedFact,
} from "../../src/product/shell/sessionContext";
import {
  encodeMotorNavigationHandoff,
  type MotorModuleId,
} from "../../src/product/shell/navigationHandoff";

const routes: Record<(typeof MOTOR_MODULES)[number]["id"], string> = {
  ccr: "../ccr/index.html",
  mama: "../mama/index.html",
};
const icons: Record<(typeof MOTOR_MODULES)[number]["id"], string> = {
  ccr: "CCR",
  mama: "MA",
};

let pendingModule: MotorModuleId | undefined;
let pendingHref: string | undefined;
let evaluationDateEdited = false;

function localIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`Missing Shell element #${id}`);
  return found as T;
}

function openSharedContextDialog(moduleId: MotorModuleId, href: string): void {
  pendingModule = moduleId;
  pendingHref = href;
  const dialog = element<HTMLDialogElement>("shared-context-dialog");
  element<HTMLElement>("shared-context-module").textContent =
    MOTOR_MODULES.find(module => module.id === moduleId)?.label ?? moduleId;
  const evaluation = element<HTMLInputElement>("shared-evaluation-date");
  if (evaluation.value === "") evaluation.value = localIsoDate();
  dialog.showModal();
  element<HTMLInputElement>("shared-birth-date").focus();
}

function cardFor(module: (typeof MOTOR_MODULES)[number]): HTMLElement {
  const article = document.createElement("article");
  article.className = "module-card";
  article.dataset.moduleId = module.id;

  const top = document.createElement("div");
  top.className = "module-topline";
  const icon = document.createElement("div");
  icon.className = "module-icon";
  icon.textContent = icons[module.id];
  icon.setAttribute("aria-hidden", "true");
  const badge = document.createElement("span");
  badge.className = "module-badge";
  badge.textContent = "Piloto interno";
  top.append(icon, badge);

  const title = document.createElement("h3");
  title.textContent = module.label;
  const description = document.createElement("p");
  description.textContent = module.description;
  const meta = document.createElement("div");
  meta.className = "module-meta";
  meta.textContent = "Módulo clínico independente · apenas fatos globais podem acompanhar esta navegação";

  const action = document.createElement("div");
  action.className = "module-action";
  const link = document.createElement("a");
  link.href = routes[module.id];
  link.dataset.moduleLink = module.id;
  const label = document.createElement("span");
  label.textContent = "Iniciar avaliação";
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  link.append(label, arrow);
  link.addEventListener("click", event => {
    event.preventDefault();
    openSharedContextDialog(module.id, link.href);
  });
  action.append(link);

  article.append(top, title, description, meta, action);
  return article;
}

const grid = element<HTMLDivElement>("module-grid");
grid.replaceChildren(...MOTOR_MODULES.map(cardFor));

const evaluationDate = element<HTMLInputElement>("shared-evaluation-date");
evaluationDate.value = localIsoDate();
evaluationDate.addEventListener("input", () => { evaluationDateEdited = true; });

const dialog = element<HTMLDialogElement>("shared-context-dialog");
element<HTMLButtonElement>("shared-context-cancel").addEventListener("click", () => {
  pendingModule = undefined;
  pendingHref = undefined;
  dialog.close();
});

element<HTMLFormElement>("shared-context-form").addEventListener("submit", event => {
  event.preventDefault();
  if (pendingModule === undefined || pendingHref === undefined) return;

  const evaluationRaw = evaluationDate.value;
  const birthRaw = element<HTMLInputElement>("shared-birth-date").value;
  let evaluation;
  let birth;
  try {
    evaluation = knownMotorSharedFact(
      motorIsoDate(evaluationRaw),
      evaluationDateEdited ? "user_supplied" as const : "system_clock" as const,
    );
    birth = birthRaw === ""
      ? unknownMotorSharedFact("not_asked")
      : knownMotorSharedFact(motorIsoDate(birthRaw), "user_supplied" as const);
  } catch {
    element<HTMLElement>("shared-context-error").textContent =
      "Revise as datas antes de continuar.";
    return;
  }

  const context = createMotorSharedSessionContext({
    evaluationDate: evaluation,
    birthDate: birth,
  });
  window.name = encodeMotorNavigationHandoff(pendingModule, context);
  const href = pendingHref;
  pendingModule = undefined;
  pendingHref = undefined;
  dialog.close();
  window.location.assign(href);
});
