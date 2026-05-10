import { describe, it, expect } from "vitest";
import { PLANNER_SYSTEM_PROMPT } from "@/lib/prompts";

describe("planner prompt", () => {
  it("mentions JSON", () => {
    expect(PLANNER_SYSTEM_PROMPT.toLowerCase()).toContain("json");
  });
});
