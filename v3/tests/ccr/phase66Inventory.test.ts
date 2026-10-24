import { describe, expect, it } from "vitest";
import {
  ccrActions,
  ccrDecisionSupport,
  ccrPhase65Rules,
  ccrSources,
  brasilAmpliadoPhase65Policy,
  internationalPhase65Policy,
  susPhase65Policy,
} from "../../src/clinical/ccr";

describe("CCR Phase 6.6 candidate inventory", () => {
  it("freezes the audited Phase 6 candidate cardinalities", () => {
    expect(ccrPhase65Rules).toHaveLength(43);
    expect(susPhase65Policy.ruleIds).toHaveLength(10);
    expect(brasilAmpliadoPhase65Policy.ruleIds).toHaveLength(13);
    expect(internationalPhase65Policy.ruleIds).toHaveLength(20);
    expect(ccrSources).toHaveLength(6);
    expect(ccrActions).toHaveLength(8);
    expect(ccrDecisionSupport).toHaveLength(7);
  });
});
