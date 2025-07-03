import type { DOMParser, DOMSerializer, Node } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { Plugin } from "prosemirror-state";
import type { DemoSetMedia } from "../src/elements/demo-image/DemoImageElement";
import type { Asset } from "../src/elements/helpers/defaultTransform";
import type {
  Image,
  MediaPayload,
  SetImage,
  SetMedia,
} from "../src/elements/helpers/types/Media";

type GridAsset = {
  mimeType: string; // e.g. ("image/jpeg", "image/png" or "image/svg+xml")
  dimensions: { width: number; height: number };
  secureUrl: string;
};

type GridResponse = {
  data: {
    image: {
      data: {
        metadata: {
          description: string;
          suppliersReference: string;
          credit: string;
          byline: string;
        };
        id: string;
      };
    };
    crop: {
      data: {
        specification: {
          uri: string;
        };
        assets: GridAsset[];
        master: GridAsset;
      };
    };
  };
};

const onGridMessage = (
  handleGridResponse: (gridResponse: GridResponse) => void,
  modal: HTMLElement
) => (response: GridResponse) => {
  modal.style.display = "None";
  handleGridResponse(response);
};

const demoHandleGridResponse = (demoSetMedia: DemoSetMedia) => ({
  data,
}: GridResponse) => {
  demoSetMedia(
    data.image.data.id,
    data.crop.data.specification.uri,
    data.crop.data.assets.map((_) => _.secureUrl),
    data.image.data.metadata.description
  );
};

const handleGridResponse = (setMedia: SetMedia) => ({ data }: GridResponse) => {
  const gridAssetToAsset = (
    gridAsset: GridAsset,
    isMaster: boolean | undefined = undefined
  ): Asset => {
    return {
      url: gridAsset.secureUrl,
      mimeType: gridAsset.mimeType,
      fields: {
        width: gridAsset.dimensions.width,
        height: gridAsset.dimensions.height,
        isMaster,
      },
      assetType: "image",
    };
  };

  setMedia({
    mediaId: data.image.data.id,
    mediaApiUri: data.crop.data.specification.uri,
    assets: data.crop.data.assets
      .map((asset) => gridAssetToAsset(asset))
      .concat(gridAssetToAsset(data.crop.data.master, true)),
    suppliersReference: data.image.data.metadata.suppliersReference,
    caption: data.image.data.metadata.description,
    photographer: data.image.data.metadata.byline,
    source: data.image.data.metadata.credit,
  });
};

const handleGridResponseForCartoon = (setImage: SetImage) => ({
  data,
}: GridResponse) => {
  const master = data.crop.data.master;
  setImage({
    mimeType: master.mimeType,
    file: master.secureUrl,
    width: master.dimensions.width,
    height: master.dimensions.height,
    mediaId: data.image.data.id,
  });
};

export const onSelectImage = (setMedia: DemoSetMedia) => {
  const modal = document.querySelector(".modal") as HTMLElement;
  modal.style.display = "Inherit";

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = `https://media.test.dev-gutools.co.uk/`;

  const listener = onGridMessage(demoHandleGridResponse(setMedia), modal);

  window.addEventListener("message", listener, {
    once: true,
  });

  document.querySelector(".modal__dismiss")?.addEventListener(
    "click",
    () => {
      window.removeEventListener("message", listener);
      modal.style.display = "None";
    },
    { once: false }
  );
};

export const onDemoCropImage = (mediaId: string, setMedia: DemoSetMedia) => {
  const modal = document.querySelector(".modal") as HTMLElement;

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = mediaId
    ? `https://media.test.dev-gutools.co.uk/images/${mediaId}`
    : `https://media.test.dev-gutools.co.uk/`;

  modal.style.display = "Inherit";
  const listener = onGridMessage(demoHandleGridResponse(setMedia), modal);

  window.addEventListener("message", listener, {
    once: true,
  });

  document.querySelector(".modal__dismiss")?.addEventListener(
    "click",
    () => {
      window.removeEventListener("message", listener);
      modal.style.display = "None";
    },
    { once: false }
  );
};

const onCrop = (
  handleResponse: (gridResponse: GridResponse) => void,
  mediaId?: string
) => {
  const modal = document.querySelector(".modal") as HTMLElement;

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = mediaId
    ? `https://media.test.dev-gutools.co.uk/images/${mediaId}`
    : `https://media.test.dev-gutools.co.uk/`;

  modal.style.display = "inherit";
  const listener = onGridMessage(handleResponse, modal);

  window.addEventListener("message", listener, {
    once: true,
  });

  document.querySelector(".modal__dismiss")?.addEventListener(
    "click",
    () => {
      window.removeEventListener("message", listener);
      modal.style.display = "none";
    },
    { once: false }
  );
};

export const onCropImage = (setMedia: SetMedia, mediaId?: string) => {
  onCrop(handleGridResponse(setMedia), mediaId);
};

export const onCropCartoon = (setImage: SetImage, mediaId?: string) => {
  onCrop(handleGridResponseForCartoon(setImage), mediaId);
};

export type SideEffectCallback = (
  tr: Transaction | null,
  oldState: EditorState | null,
  newState: EditorState
) => void;

export const sideEffectPlugin = (cb: SideEffectCallback): Plugin<void> =>
  new Plugin({
    state: {
      init: (_, state) => cb(null, null, state),
      apply: (tr, _, prev, state) => cb(tr, prev, state),
    },
  });

export const getImageFromMediaPayload = (
  mediaPayload: MediaPayload
): Image | undefined => {
  const mainAsset = mediaPayload.assets.find((asset) => asset.fields.isMaster);

  if (!mainAsset) return undefined;

  return {
    mimeType: mainAsset.mimeType,
    file: mainAsset.url,
    width: +mainAsset.fields.width,
    height: +mainAsset.fields.height,
    mediaId: mediaPayload.mediaId,
  };
};

export const docToHtml = (serializer: DOMSerializer, doc: Node) => {
  const dom = serializer.serializeFragment(doc.content);
  const e = document.createElement("div");
  e.appendChild(dom);
  return e.innerHTML;
};

export const htmlToDoc = (parser: DOMParser, html: string) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return parser.parse(dom, { preserveWhitespace: true });
};
