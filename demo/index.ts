import { FocusStyleManager } from "@guardian/src-foundations/utils";
import omit from "lodash/omit";
import type OrderedMap from "orderedmap";
import { collab } from "prosemirror-collab";
import { exampleSetup } from "prosemirror-example-setup";
import type { MarkSpec, Node, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema, marks } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import {
  codeElement,
  createDemoImageElement,
  createEmbedElement,
  createImageElement,
  createInteractiveElement,
  membershipElement,
  pullquoteElement,
  richlinkElement,
} from "../src";
import {
  transformElementOut,
  undefinedDropdownValue,
} from "../src/elements/helpers/transform";
import type { MediaPayload } from "../src/elements/image/ImageElement";
import { createStandardElement } from "../src/elements/standard/StandardSpec";
import { buildElementPlugin } from "../src/plugin/element";
import {
  createParsers,
  docToHtml,
  htmlToDoc,
} from "../src/plugin/helpers/prosemirror";
import { testDecorationPlugin } from "../src/plugin/helpers/test";
import { CollabServer, EditorConnection } from "./collab/CollabServer";
import { createSelectionCollabPlugin } from "./collab/SelectionPlugin";
import {
  onCropImage,
  onDemoCropImage,
  onSelectImage,
  sideEffectPlugin,
} from "./helpers";
import type { WindowType } from "./types";

// Only show focus when the user is keyboard navigating, not when
// they click a text field.
FocusStyleManager.onlyShowFocusOnTabs();
const embedElementName = "embed";
const imageElementName = "image";
const demoImageElementName = "demo-image-element";
const codeElementName = "codeElement";
const pullquoteElementName = "pullquoteElement";
const richlinkElementName = "richlinkElement";
const videoElementName = "videoElement";
const mapElementName = "mapElement";
const audioElementName = "audioElement";
const documentElementName = "documentElement";
const tableElementName = "tableElement";
const interactiveElementName = "interactiveElement";
const membershipElementName = "membership";

type Name =
  | typeof embedElementName
  | typeof imageElementName
  | typeof demoImageElementName
  | typeof codeElementName
  | typeof pullquoteElementName
  | typeof richlinkElementName
  | typeof interactiveElementName
  | typeof videoElementName
  | typeof mapElementName
  | typeof audioElementName
  | typeof documentElementName
  | typeof tableElementName
  | typeof membershipElementName;

const createCaptionPlugins = (schema: Schema) => exampleSetup({ schema });
const mockThirdPartyTracking = (html: string) =>
  html.includes("fail")
    ? Promise.resolve({
        tracking: {
          tracks: "tracks",
        },
        reach: { unsupportedPlatforms: ["amp", "mobile"] },
      })
    : Promise.resolve({
        tracking: {
          tracks: "does-not-track",
        },
        reach: { unsupportedPlatforms: [] },
      });

const additionalRoleOptions = [
  { text: "inline (default)", value: undefinedDropdownValue },
  { text: "supporting", value: "supporting" },
  { text: "showcase", value: "showcase" },
  { text: "immersive", value: "immersive" },
];

const {
  element: imageElement,
  updateAdditionalRoleOptions,
} = createImageElement({
  openImageSelector: onCropImage,
  createCaptionPlugins,
  additionalRoleOptions,
});

const standardElement = createStandardElement({
  createCaptionPlugins,
  checkThirdPartyTracking: mockThirdPartyTracking,
});

const {
  plugin: elementPlugin,
  insertElement,
  nodeSpec,
  getElementDataFromNode,
} = buildElementPlugin({
  "demo-image-element": createDemoImageElement(onSelectImage, onDemoCropImage),
  image: imageElement,
  embed: createEmbedElement({
    checkThirdPartyTracking: mockThirdPartyTracking,
    convertTwitter: (src) => console.log(`Add Twitter embed with src: ${src}`),
    convertYouTube: (src) => console.log(`Add youtube embed with src: ${src}`),
    createCaptionPlugins,
    targetingUrl: "https://targeting.code.dev-gutools.co.uk",
  }),
  interactive: createInteractiveElement({
    checkThirdPartyTracking: mockThirdPartyTracking,
    createCaptionPlugins,
  }),
  codeElement,
  pullquoteElement,
  "rich-link": richlinkElement,
  videoElement: standardElement,
  audioElement: standardElement,
  mapElement: standardElement,
  tableElement: standardElement,
  documentElement: standardElement,
  membership: membershipElement,
});

const strike: MarkSpec = {
  parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }],
  toDOM() {
    return ["s"];
  },
};

const schema = new Schema({
  nodes: (basicSchema.spec.nodes as OrderedMap<NodeSpec>).append(nodeSpec),
  marks: { ...omit(marks, "code"), strike },
});

const { serializer, parser } = createParsers(schema);

const editorsContainer = document.querySelector("#editor-container");
const btnContainer = document.getElementById("button-container");
if (!editorsContainer || !btnContainer) {
  throw new Error("No #editor element present in DOM");
}

const get = () => {
  const state = window.localStorage.getItem("pm");
  return state
    ? htmlToDoc(parser, state)
    : htmlToDoc(
        parser,
        document.getElementById("content-template")?.innerHTML ?? ""
      );
};

const set = (doc: Node) =>
  window.localStorage.setItem("pm", docToHtml(serializer, doc));

let editorNo = 0;
// We use this as a source of truth when instantiating new editors.
let firstCollabPlugin: ReturnType<typeof collab> | undefined;
let firstEditor: EditorView | undefined;

const createEditor = (server: CollabServer) => {
  // Add the editor nodes to the DOM
  const isFirstEditor = !firstEditor;
  const editorElement = document.createElement("div");
  editorElement.id = `editor-${editorNo}`;
  editorElement.classList.add("Editor");
  editorsContainer.appendChild(editorElement);

  const contentElement = document.getElementById(`content-${editorNo}`);
  if (contentElement?.parentElement) {
    contentElement.parentElement.removeChild(contentElement);
  }

  // Create the editor
  const clientID = editorNo.toString();
  const currentVersion =
    firstEditor && firstCollabPlugin
      ? (firstCollabPlugin.getState(firstEditor.state) as number)
      : 0;
  const collabPlugin = collab({ version: currentVersion, clientID });

  const dataPane = document.getElementById("content-data");
  const dataPaneOpenClass = "show-data";
  const dataToggle = document.getElementById("content-data-toggle");

  let paneOpen = false;

  dataToggle?.addEventListener("click", () => {
    paneOpen = !paneOpen;
    if (paneOpen) {
      dataPane?.classList.remove(dataPaneOpenClass);
    } else {
      dataPane?.classList.add(dataPaneOpenClass);
    }
  });

  const getElementData = (state: EditorState) => {
    const elementData: Array<ReturnType<typeof getElementDataFromNode>> = [];
    state.doc.forEach((node) => {
      const maybeElementData = getElementDataFromNode(node, serializer);
      if (maybeElementData) {
        elementData.push(
          transformElementOut(
            maybeElementData.elementName as any,
            maybeElementData.values
          )
        );
      }
    });
    return elementData;
  };

  const updateElementDataPlugin = sideEffectPlugin((tr, _, state) => {
    if (tr && !tr.docChanged) {
      return;
    }

    const newData = getElementData(state);
    if (dataPane) {
      dataPane.innerText = JSON.stringify(newData, null, 2);
    }
  });

  const view = new EditorView(editorElement, {
    state: EditorState.create({
      doc: isFirstEditor ? get() : firstEditor?.state.doc,
      plugins: [
        ...exampleSetup({ schema }),
        elementPlugin,
        testDecorationPlugin,
        collabPlugin,
        updateElementDataPlugin,
        createSelectionCollabPlugin(clientID),
      ],
    }),
  });

  if (!isFirstEditor) {
    firstEditor = view;
  }

  const createElementButton = (
    buttonText: string,
    elementName: Name,
    values: Record<string, unknown>
  ) => {
    const elementButton = document.createElement("button");
    elementButton.innerHTML = buttonText;
    elementButton.id = elementName;
    elementButton.addEventListener("click", () =>
      insertElement({ elementName, values })(view.state, view.dispatch)
    );
    btnContainer.appendChild(elementButton);
  };

  createElementButton("Interactive element", interactiveElementName, {
    iframeUrl:
      "https://interactive.guim.co.uk/embed/from-tool/looping-video/index.html?poster-image=https%3A%2F%2Fmedia.gutools.co.uk%2Fimages%2F6abeae73a94789a596acb1146d5df554695536ba%3Fcrop%3D60_0_1800_1080&mp4-video=https%3A%2F%2Fuploads.guim.co.uk%2F2022%2F02%2F24%2F220224_Helicopters_3.mp4",
    scriptName: "iframe-wrapper",
    source: "Guardian",
    isMandatory: "false",
    originalUrl:
      "https://interactive.guim.co.uk/embed/from-tool/looping-video/index.html?poster-image=https%3A%2F%2Fmedia.gutools.co.uk%2Fimages%2F6abeae73a94789a596acb1146d5df554695536ba%3Fcrop%3D60_0_1800_1080&mp4-video=https%3A%2F%2Fuploads.guim.co.uk%2F2022%2F02%2F24%2F220224_Helicopters_3.mp4",
    scriptUrl:
      "https://interactive.guim.co.uk/embed/iframe-wrapper/0.1/boot.js",
    alt: "Hostomel airbase",
    html: `<a href="https://interactive.guim.co.uk/embed/from-tool/looping-video/index.html?poster-image=https%3A%2F%2Fmedia.gutools.co.uk%2Fimages%2F6abeae73a94789a596acb1146d5df554695536ba%3Fcrop%3D60_0_1800_1080&mp4-video=https%3A%2F%2Fuploads.guim.co.uk%2F2022%2F02%2F24%2F220224_Helicopters_3.mp4">Hostomel airbase</a>`,
  });

  createElementButton("Embed element", embedElementName, {
    weighting: "",
    sourceUrl: "",
    embedCode: "",
    caption: "",
    altText: "",
    required: false,
  });

  createElementButton("Callout element", embedElementName, {
    altText: "",
    caption: "",
    html:
      '<div data-callout-tagname="test-form-six"><h2>Callout<h2><p>test-form-six</p></div>',
  });

  createElementButton("Demo image element", demoImageElementName, {
    altText: "",
    caption: "",
    useSrc: { value: false },
  });

  createElementButton("Rich-link element", richlinkElementName, {
    linkText: "example2",
    url: "https://example.com",
    weighting: "",
    draftReference: "",
  });

  createElementButton("Video element", videoElementName, {
    source: "YouTube",
    isMandatory: "false",
    role: "showcase",
    url: "https://www.youtube.com/watch?v=BggrpKfqh1c",
    description: "This ain't real Latin",
    originalUrl: "https://www.youtube.com/watch?v=BggrpKfqh1c",
    height: "259",
    title: "Lorem Ipsum",
    html:
      '\n            <iframe\n                height="259"\n                width="460"\n                src="https://www.youtube.com/embed/jUghnM2qy9M?wmode=opaque&feature=oembed"\n                frameborder="0"\n                allowfullscreen\n            ></iframe>\n        ',
    width: "460",
    authorName: "Lorem Ipsum",
  });

  createElementButton("Audio element", audioElementName, {
    source: "SoundCloud",
    isMandatory: "false",
    description: `Brighton born and raised ArrDee has exploded onto the scene with his unique flow; venting the real relatable issues wrapped up in his signature "cheeky chappy" sound. Now amassing half a million views`,
    originalUrl: "https://soundcloud.com/arrdee-music/oliver-twist",
    height: "460",
    title: "Oliver Twist by ArrDee",
    html: `
            <iframe
                height="460"
                width="460"
                src="https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F1056911326&show_artwork=true"
                frameborder="0"
                allowfullscreen
            ></iframe>
        `,
    width: "460",
    authorName: "ArrDee",
  });

  createElementButton("Map element", mapElementName, {
    source: "Google Maps",
    description:
      "Find local businesses, view maps and get driving directions in Google Maps",
    originalUrl:
      "https://maps.google.com/maps?q=Cumbria,+United+Kingdom&hl=en&ll=54.27164,-3.032227&spn=5.930277,9.63501&sll=52.589701,-2.746582&sspn=6.169247,9.63501&oq=cumbria&hnear=Cumbria,+United+Kingdom&t=m&z=7",
    height: "379",
    title: "Cumbria, United Kingdom - Google Maps",
    html: `<iframe width="460" height="379" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=Cumbria,+United+Kingdom&hl=en&ll=54.27164,-3.032227&spn=5.930277,9.63501&sll=52.589701,-2.746582&sspn=6.169247,9.63501&oq=cumbria&hnear=Cumbria,+United+Kingdom&t=m&z=7&output=embed"></iframe>`,
    width: "460",
  });

  createElementButton("Document element", mapElementName, {
    source: "Google Docs",
    isMandatory: "false",
    description:
      "Create a new document and edit with others at the same time -- from your computer, phone or tablet. Get stuff done with or without an internet connection. Use Docs to edit Word files. Free from Google.",
    originalUrl:
      "https://docs.google.com/document/d/11rMDXDUnirxA_RQGlMxrMJ39qFtC8rW4nA88lgxFaMQ/edit?ts=60f1608f",
    height: "348",
    title: "Google Docs - create and edit documents online, for free.",
    html: `
                <iframe
                    height="348"
                    width="460"
                    src="https://docs.google.com/document/d/e/11rMDXDUnirxA_RQGlMxrMJ39qFtC8rW4nA88lgxFaMQ/pub?embedded=true"
                    frameborder="0"
                    allowfullscreen
                ></iframe>
            `,
    width: "460",
  });

  createElementButton("Add membership element", membershipElementName, {
    linkText:
      "Feminism in China: #MeToo, silenced women and the fight for equality",
    isMandatory: "true",
    identifier: "guardian-live",
    image:
      "https://media.guim.co.uk/c76308f105b589a7f8d6003231c6017e134be36e/0_0_1280_768/500.jpg",
    originalUrl:
      "https://membership.theguardian.com/event/feminism-in-china-metoo-silenced-women-and-the-fight-for-equality-226877896897",
    price: "£7",
    linkPrefix: "Membership Event: ",
    end: "2022-03-02T21:00:00.000Z",
    title:
      "Feminism in China: #MeToo, silenced women and the fight for equality",
    start: "2022-03-02T20:00:00.000Z",
  });

  const imageElementButton = document.createElement("button");
  imageElementButton.innerHTML = "Image element";
  imageElementButton.id = imageElementName;
  imageElementButton.addEventListener("click", () => {
    const setMedia = (mediaPayload: MediaPayload) => {
      const {
        mediaId,
        mediaApiUri,
        assets,
        suppliersReference,
        caption,
        photographer,
        source,
      } = mediaPayload;
      insertElement({
        elementName: imageElementName,
        values: {
          caption,
          photographer,
          source,
          mainImage: { assets, suppliersReference, mediaId, mediaApiUri },
        },
      })(view.state, view.dispatch);
    };
    onCropImage(setMedia);
  });

  // Add a button allowing you to toggle the image role fields
  btnContainer.appendChild(imageElementButton);
  const toggleImageFields = document.createElement("button");
  toggleImageFields.innerHTML = "Randomise image role options";

  toggleImageFields.addEventListener("click", () => {
    updateAdditionalRoleOptions(
      [...additionalRoleOptions].splice(Math.floor(Math.random() * 3), 2)
    );
  });
  btnContainer.appendChild(toggleImageFields);

  createElementButton("Pullquote element", pullquoteElementName, {
    pullquote: "",
    attribution: "",
    weighting: "supporting",
  });

  createElementButton("Code element", codeElementName, {
    codeText: "",
    language: "Plain text",
  });

  new EditorConnection(view, server, clientID, `User ${clientID}`, (state) => {
    if (isFirstEditor) {
      set(state.doc);
    }
  });

  editorNo++;

  return view;
};

const server = new CollabServer();
firstEditor = createEditor(server);
const doc = firstEditor.state.doc;
server.init(doc);

// Add more editors
const addEditorButton = document.createElement("button");
addEditorButton.innerHTML = "Add another editor";
addEditorButton.id = "add-editor";
addEditorButton.addEventListener("click", () => createEditor(server));
btnContainer.appendChild(addEditorButton);

// Handy debugging tools. We assign a few things to window for our integration tests,
// and to facilitate debugging.
export { insertElement }; // Necessary to ensure the type is available in the global namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface -- necessary to extend the Window object
  interface Window extends WindowType {}
}

window.ProseMirrorDevTools.applyDevTools(firstEditor, {
  EditorState,
});

window.PM_ELEMENTS = {
  view: firstEditor,
  insertElement: insertElement,
  docToHtml: () =>
    firstEditor ? docToHtml(serializer, firstEditor.state.doc) : "",
  htmlToDoc: (html: string) => {
    const node = htmlToDoc(parser, html);
    firstEditor?.updateState(
      EditorState.create({
        doc: node,
        plugins: firstEditor.state.plugins,
      })
    );
  },
};
