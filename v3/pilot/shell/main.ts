import { MOTOR_MODULES } from "../../src/product/shell";

const routes: Record<(typeof MOTOR_MODULES)[number]["id"], string> = {
  ccr: "../ccr/index.html",
  mama: "../mama/index.html",
};
const icons: Record<(typeof MOTOR_MODULES)[number]["id"], string> = {
  ccr: "CCR",
  mama: "MA",
};

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
  meta.textContent = "Módulo clínico independente · sem compartilhamento automático de dados";

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
  action.append(link);

  article.append(top, title, description, meta, action);
  return article;
}

const grid = document.getElementById("module-grid");
if (grid === null) throw new Error("Missing #module-grid");
grid.replaceChildren(...MOTOR_MODULES.map(cardFor));
