import { describe, expect, it } from "vitest";
import { parseLook, withLook } from "./look";

describe("look", () => {
  it("defaults to the CCTV look for missing or unknown values", () => {
    expect(parseLook(undefined)).toBe("cctv");
    expect(parseLook("neon")).toBe("cctv");
    expect(parseLook("clean")).toBe("clean");
  });

  it("keeps the style in the URL only when it isn't the default", () => {
    expect(withLook("?slide=2", "cctv")).toBe("?slide=2");
    expect(withLook("?slide=2&beat=3", "clean")).toBe("?slide=2&beat=3&style=clean");
  });
});
