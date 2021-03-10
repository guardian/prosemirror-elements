import { build } from "../../../embed";

describe("build", () => {
  it("creates a plugin, and insertEmbed and hasErrors methods", () => {
    const { plugin, insertEmbed, hasErrors } = build({})
    expect(plugin).to.exist
    expect(insertEmbed).to.exist
    expect(hasErrors).to.exist
  });
});
