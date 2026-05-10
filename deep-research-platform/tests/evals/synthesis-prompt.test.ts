import { describe, it, expect } from "vitest";
import { SYNTHESIS_SYSTEM_PROMPT } from "@/lib/prompts";

describe("synthesis prompt", () => {
  it("mentions references", () => {
    expect(SYNTHESIS_SYSTEM_PROMPT.toLowerCase()).toContain("references");
  });
});
