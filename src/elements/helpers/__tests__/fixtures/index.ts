import audio from "./audio.fixture.json";
import comment from "./comment.fixture.json";
import contentAtom from "./content-atom.fixture.json";
import document from "./document.fixture.json";
import embed from "./embed.fixture.json";
import form from "./form.fixture.json";
import image from "./image.fixture.json";
import instagram from "./instagram.fixture.json";
import interactive from "./interactive.fixture.json";
import map from "./map.fixture.json";
import membership from "./membership.fixture.json";
import pullquote from "./pullquote.fixture.json";
import richLink from "./rich-link.fixture.json";
import table from "./table.fixture.json";
import tweet from "./tweet.fixture.json";
import vine from "./vine.fixture.json";
import witness from "./witness.fixture.json";

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
  { name: "image", fixtures: image },
  { name: "pullquote", fixtures: pullquote, defaults: { role: "supporting" } },
  { name: "embed", fixtures: embed, defaults: { role: undefined } },
  { name: "interactive", fixtures: interactive },
];
