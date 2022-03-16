import audio from "./audio.json";
import document from "./document.json";
import map from "./map.json";
import membership from "./membership.json";
import richLink from "./rich-link.json";

/**
 * A map of our element fixtures, where the key represents the element name that
 * corresponds to the fixture, and the value is the fixture object.
 */
export const allElementFixtures = {
  "rich-link": richLink,
  membership,
  audio,
  map,
  document,
};
