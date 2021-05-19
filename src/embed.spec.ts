import { build } from "./embed";

describe("build", () => {
  it("creates a plugin, insertEmbed and hasErrors methods, and a nodeSpec", () => {
    const { plugin, insertEmbed, hasErrors } = build({});
    expect(plugin).toBeTruthy();
    expect(insertEmbed).toBeTruthy();
    expect(hasErrors).toBeTruthy();
  });
});
