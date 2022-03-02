import type { EditorState, Transaction } from "prosemirror-state";
import { Plugin } from "prosemirror-state";
import type { DemoSetMedia } from "../src/elements/demo-image/DemoImageElement";
import type { Asset, SetMedia } from "../src/elements/image/ImageElement";

type GridAsset = {
  mimeType: string;
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
          source: string;
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
    source: data.image.data.metadata.source,
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

export const onCropImage = (setMedia: SetMedia, mediaId?: string) => {
  const modal = document.querySelector(".modal") as HTMLElement;

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = mediaId
    ? `https://media.test.dev-gutools.co.uk/images/${mediaId}`
    : `https://media.test.dev-gutools.co.uk/`;

  modal.style.display = "inherit";
  const listener = onGridMessage(handleGridResponse(setMedia), modal);

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
