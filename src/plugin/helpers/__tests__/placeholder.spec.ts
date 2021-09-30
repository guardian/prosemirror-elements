import { schema } from "prosemirror-schema-basic";
import { DecorationSet } from "prosemirror-view";
import { createPlaceholderDecos } from "../placeholder";
import { getDecoSpecs } from "../test";

describe("createPlaceholderDecos", () => {
  it("should not add a decoration given a contentful inline doc", () => {
    const doc = schema.nodes.doc.create({}, schema.text("Content"));
    expect(createPlaceholderDecos("Placeholder")({ doc })).toBe(
      DecorationSet.empty
    );
  });
  it("should add a decoration given a contentless inline doc", () => {
    const doc = schema.nodes.doc.create({});
    const decoSpecs = getDecoSpecs(
      createPlaceholderDecos("Placeholder")({ doc })
    );
    expect(decoSpecs).toEqual([{ from: 0, to: 0 }]);
  });
  it("should not add a decoration given a contentful doc with paragraphs", () => {
    const doc = schema.nodes.doc.create(
      {},
      schema.nodes.paragraph.create({}, schema.text("Content"))
    );
    expect(createPlaceholderDecos("Placeholder")({ doc })).toBe(
      DecorationSet.empty
    );
  });
  it("should add a decoration given a contentless doc with paragraphs", () => {
    const doc = schema.nodes.doc.create({}, schema.nodes.paragraph.create({}));
    const decoSpecs = getDecoSpecs(
      createPlaceholderDecos("Placeholder")({ doc })
    );
    expect(decoSpecs).toEqual([{ from: 1, to: 1 }]);
  });
});
