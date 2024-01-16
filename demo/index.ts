import { FocusStyleManager } from "@guardian/src-foundations/utils";
import { UserTelemetryEventSender } from "@guardian/user-telemetry-client";
import omit from "lodash/omit";
import { collab } from "prosemirror-collab";
import applyDevTools from "prosemirror-dev-tools";
import { exampleSetup } from "prosemirror-example-setup";
import type { MarkSpec, Node } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { schema as basicSchema, marks } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { buildElementPlugin, undefinedDropdownValue } from "../src";
import { altStyleElement } from "../src/elements/alt-style/AltStyleElementForm";
import { createCalloutElement } from "../src/elements/callout/Callout";
import { createCartoonElement } from "../src/elements/cartoon/CartoonForm";
import { codeElement } from "../src/elements/code/CodeElementForm";
import { commentElement } from "../src/elements/comment/CommentForm";
import { createContentAtomElement } from "../src/elements/content-atom/ContentAtomForm";
import { createDemoImageElement } from "../src/elements/demo-image/DemoImageElementForm";
import { deprecatedElement } from "../src/elements/deprecated/DeprecatedForm";
import { createEmbedElement } from "../src/elements/embed/EmbedForm";
import { transformElementOut } from "../src/elements/helpers/transform";
import type { MediaPayload } from "../src/elements/helpers/types/Media";
import { createImageElement } from "../src/elements/image/ImageElementForm";
import { createInteractiveElement } from "../src/elements/interactive/InteractiveForm";
import { membershipElement } from "../src/elements/membership/MembershipForm";
import { pullquoteElement } from "../src/elements/pullquote/PullquoteForm";
import { recipeElement } from "../src/elements/recipe/RecipeElementForm";
import { richlinkElement } from "../src/elements/rich-link/RichlinkForm";
import { createStandardElement } from "../src/elements/standard/StandardForm";
import { tableElement } from "../src/elements/table/TableForm";
import { createTweetElement } from "../src/elements/tweet/TweetForm";
import {
  createParsers,
  docToHtml,
  htmlToDoc,
} from "../src/plugin/helpers/prosemirror";
import { testDecorationPlugin } from "../src/plugin/helpers/test";
import { CollabServer, EditorConnection } from "./collab/CollabServer";
import { createSelectionCollabPlugin } from "./collab/SelectionPlugin";
import {
  getImageFromMediaPayload,
  onCropCartoon,
  onCropImage,
  onDemoCropImage,
  onSelectImage,
  sideEffectPlugin,
} from "./helpers";
import {
  sampleAltStylesElement,
  sampleAudio,
  sampleCallout,
  sampleCampaignCalloutList,
  sampleCampaignList,
  sampleCode,
  sampleComment,
  sampleContentAtom,
  sampleDocument,
  sampleEmbed,
  sampleForm,
  sampleImage,
  sampleInteractive,
  sampleInteractiveAtom,
  sampleMap,
  sampleMembership,
  samplePullquote,
  sampleRecipe,
  sampleRichLink,
  sampleTable,
  sampleTweet,
  sampleVideo,
  sampleVine,
} from "./sampleElements";
import type { WindowType } from "./types";

// Only show focus when the user is keyboard navigating, not when
// they click a text field.
FocusStyleManager.onlyShowFocusOnTabs();
const embedElementName = "embed";
const imageElementName = "image";
const demoImageElementName = "demo-image-element";
const codeElementName = "code";
const formElementName = "form";
const pullquoteElementName = "pullquote";
const recipeElementName = "recipe";
const richlinkElementName = "rich-link";
const videoElementName = "video";
const mapElementName = "map";
const audioElementName = "audio";
const documentElementName = "document";
const tableElementName = "table";
const interactiveElementName = "interactive";
const membershipElementName = "membership";
const witnessElementName = "witness";
const instagramElementName = "instagram";
const vineElementName = "vine";
const tweetElementName = "tweet";
const contentAtomName = "content-atom";
const commentElementName = "comment";
const campaignCalloutListElementName = "callout";
const cartoonElementName = "cartoon";
const altStyleElementName = "alt-style";

type Name =
  | typeof embedElementName
  | typeof imageElementName
  | typeof demoImageElementName
  | typeof codeElementName
  | typeof formElementName
  | typeof pullquoteElementName
  | typeof recipeElementName
  | typeof richlinkElementName
  | typeof interactiveElementName
  | typeof videoElementName
  | typeof mapElementName
  | typeof audioElementName
  | typeof documentElementName
  | typeof tableElementName
  | typeof membershipElementName
  | typeof witnessElementName
  | typeof instagramElementName
  | typeof vineElementName
  | typeof tweetElementName
  | typeof contentAtomName
  | typeof commentElementName
  | typeof campaignCalloutListElementName
  | typeof cartoonElementName
  | typeof altStyleElementName;

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
  { text: "thumbnail", value: "thumbnail" },
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
  useLargePreview: false,
});

const telemetryEventService = new UserTelemetryEventSender("example.com");

const {
  plugin: elementPlugin,
  insertElement,
  nodeSpec,
  getElementDataFromNode,
} = buildElementPlugin(
  {
    "demo-image-element": createDemoImageElement(
      onSelectImage,
      onDemoCropImage
    ),
    image: imageElement,
    embed: createEmbedElement({
      checkThirdPartyTracking: mockThirdPartyTracking,
      convertTwitter: (src) =>
        console.log(`Add Twitter embed with src: ${src}`),
      convertYouTube: (src) =>
        console.log(`Add youtube embed with src: ${src}`),
      createCaptionPlugins,
      targetingUrl: "https://targeting.code.dev-gutools.co.uk",
    }),
    callout: createCalloutElement({
      fetchCampaignList: () => Promise.resolve(sampleCampaignList),
      targetingUrl: "https://targeting.code.dev-gutools.co.uk/",
    }),
    interactive: createInteractiveElement({
      checkThirdPartyTracking: mockThirdPartyTracking,
      createCaptionPlugins,
    }),
    code: codeElement,
    form: deprecatedElement,
    pullquote: pullquoteElement,
    recipe: recipeElement,
    "rich-link": richlinkElement,
    video: createStandardElement({
      createCaptionPlugins,
      checkThirdPartyTracking: mockThirdPartyTracking,
      hasThumbnailRole: false,
    }),
    audio: standardElement,
    map: standardElement,
    table: tableElement,
    document: createStandardElement({
      createCaptionPlugins,
      checkThirdPartyTracking: mockThirdPartyTracking,
      useLargePreview: true,
    }),
    membership: membershipElement,
    witness: deprecatedElement,
    vine: deprecatedElement,
    instagram: deprecatedElement,
    comment: commentElement,
    cartoon: createCartoonElement(onCropCartoon, createCaptionPlugins),
    tweet: createTweetElement({
      checkThirdPartyTracking: mockThirdPartyTracking,
      createCaptionPlugins,
    }),
    "content-atom": createContentAtomElement(() =>
      Promise.resolve({
        title: "Test Atom",
        defaultHtml: `<div class="atom-Profile">
          <p><strong>Test item</strong></p>
          <p><p>-here is a test item</p></p>
          <p><strong>second post</strong></p>
          <p><p>- test</p></p>
        </div>`,
        isPublished: false,
        hasUnpublishedChanges: true,
        embedLink: "https://example.com",
        editorLink: "https://example.com",
      })
    ),
    "alt-style": altStyleElement,
  },
  {
    sendTelemetryEvent: (type: string, tags) =>
      telemetryEventService.addEvent({
        app: "ProseMirrorElements",
        stage: "TEST",
        eventTime: new Date().toISOString(),
        type,
        value: true,
        tags,
      }),
  }
);

const strike: MarkSpec = {
  parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }],
  toDOM() {
    return ["s"];
  },
};

const docNodeSpec = {
  doc: {
    content: "block*",
    toDOM: (): [string, ...any[]] => ["div", 0],
  },
};

const schema = new Schema({
  nodes: basicSchema.spec.nodes.append(docNodeSpec).append(nodeSpec),
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
    elementButton.innerHTML = `Add ${buttonText}`;
    elementButton.id = elementName;
    elementButton.addEventListener("click", () =>
      insertElement({ elementName, values })(view.state, view.dispatch)
    );
    btnContainer.appendChild(elementButton);
  };

  const buttonData = [
    {
      label: "Campaign Callout List",
      name: campaignCalloutListElementName,
      values: sampleCampaignCalloutList,
    },
    { label: "Embed", name: embedElementName, values: sampleEmbed },
    { label: "Callout", name: embedElementName, values: sampleCallout },
    { label: "Demo image", name: demoImageElementName, values: sampleImage },
    { label: "Rich-link", name: richlinkElementName, values: sampleRichLink },
    { label: "Video", name: videoElementName, values: sampleVideo },
    { label: "Audio", name: audioElementName, values: sampleAudio },
    { label: "Map", name: mapElementName, values: sampleMap },
    { label: "Document", name: documentElementName, values: sampleDocument },
    { label: "Table", name: tableElementName, values: sampleTable },
    {
      label: "Membership",
      name: membershipElementName,
      values: sampleMembership,
    },
    {
      label: "Interactive",
      name: interactiveElementName,
      values: sampleInteractive,
    },
    { label: "Pullquote", name: pullquoteElementName, values: samplePullquote },
    { label: "Code", name: codeElementName, values: sampleCode },
    { label: "Form", name: formElementName, values: sampleForm },
    { label: "Vine", name: vineElementName, values: sampleVine },
    { label: "Tweet", name: tweetElementName, values: sampleTweet },
    { label: "Recipe", name: recipeElementName, values: sampleRecipe },
    { label: "Recipe atom", name: contentAtomName, values: sampleContentAtom },
    {
      label: "Interactive atom",
      name: contentAtomName,
      values: sampleInteractiveAtom,
    },
    { label: "Comment", name: commentElementName, values: sampleComment },
    {
      label: "Alt Style",
      name: altStyleElementName,
      values: sampleAltStylesElement,
    },
  ] as const;

  buttonData.map(({ label, name, values }) =>
    createElementButton(label, name, values)
  );

  const imageElementButton = document.createElement("button");
  imageElementButton.innerHTML = "Add Image";
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
  btnContainer.appendChild(imageElementButton);

  const cartoonElementButton = document.createElement("button");
  cartoonElementButton.innerHTML = "Add Cartoon";
  cartoonElementButton.id = cartoonElementName;
  cartoonElementButton.addEventListener("click", () => {
    const setMedia = (mediaPayload: MediaPayload) => {
      const { photographer, caption, source } = mediaPayload;

      const imageToInsert = getImageFromMediaPayload(mediaPayload);

      // TODO: handle this error
      if (!imageToInsert) return;

      insertElement({
        elementName: cartoonElementName,
        values: {
          largeImages: [imageToInsert],
          photographer,
          source,
          caption,
        },
      })(view.state, view.dispatch);
    };
    onCropImage(setMedia);
  });
  btnContainer.appendChild(cartoonElementButton);

  // Add a button allowing you to toggle the image role fields
  const toggleImageFields = document.createElement("button");
  toggleImageFields.innerHTML = "Randomise image role options";
  toggleImageFields.addEventListener("click", () => {
    updateAdditionalRoleOptions(
      [...additionalRoleOptions].splice(Math.floor(Math.random() * 3), 2)
    );
  });
  btnContainer.appendChild(toggleImageFields);

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

applyDevTools(firstEditor);

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
