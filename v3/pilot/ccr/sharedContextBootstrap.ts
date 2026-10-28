import { projectSharedSessionContextToCcr } from "../../src/product/ccr";
import { consumeMotorNavigationHandoff } from "../../src/product/shell/navigationHandoff";

const context = consumeMotorNavigationHandoff(window, "ccr");
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
