import audio from "./audio.json";
import comment from "./comment.json";
import contentAtom from "./content-atom.json";
import document from "./document.json";
import form from "./form.json";
import instagram from "./instagram.json";
import map from "./map.json";
import membership from "./membership.json";
import richLink from "./rich-link.json";
import table from "./table.json";
import tweet from "./tweet.json";
import vine from "./vine.json";
import witness from "./witness.json";

/**
 * A map of our element fixtures, where the key represents the element name that
 * corresponds to the fixture, and the value is the fixture object.
 */
export const allElementFixtures = [
  { name: "content-atom", fixtures: contentAtom },
  { name: "rich-link", fixtures: richLink, defaults: { role: "thumbnail" } },
  { name: "membership", fixtures: membership },
  { name: "audio", fixtures: audio },
  { name: "map", fixtures: map },
  { name: "document", fixtures: document },
  { name: "table", fixtures: table },
  { name: "witness", fixtures: witness },
  { name: "vine", fixtures: vine },
  { name: "instagram", fixtures: instagram },
  { name: "tweet", fixtures: tweet },
  { name: "comment", fixtures: comment },
  { name: "form", fixtures: form },
];
