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

export const onGridMessage = (setMedia: DemoSetMedia, modal: HTMLElement) => ({
  data,
}: GridResponse) => {
  modal.style.display = "None";
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

  setMedia(
    data.image.data.id,
    data.crop.data.specification.uri,
    data.crop.data.assets.map((_) => _.secureUrl),
    data.image.data.metadata.description
    // data.crop.data.assets
    //   .map((asset) => gridAssetToAsset(asset))
    //   .concat(gridAssetToAsset(data.crop.data.master, true)),
    // data.image.data.metadata.suppliersReference
  );
};

export const onSelectImage = (setMedia: DemoSetMedia) => {
  const modal = document.querySelector(".modal") as HTMLElement;
  modal.style.display = "Inherit";

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = `https://media.test.dev-gutools.co.uk/`;

  const listener = onGridMessage(setMedia, modal);

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
  const listener = onGridMessage(setMedia, modal);

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

// export const onCropImage = (setMedia: SetMedia, mediaId?: string) => {
//   const modal = document.querySelector(".modal") as HTMLElement;

//   (document.querySelector(
//     ".modal__body iframe"
//   ) as HTMLIFrameElement).src = mediaId
//     ? `https://media.test.dev-gutools.co.uk/images/${mediaId}`
//     : `https://media.test.dev-gutools.co.uk/`;

//   modal.style.display = "Inherit";
//   const listener = onGridMessage(setMedia, modal);

//   window.addEventListener("message", listener, {
//     once: true,
//   });

//   document.querySelector(".modal__dismiss")?.addEventListener(
//     "click",
//     () => {
//       window.removeEventListener("message", listener);
//       modal.style.display = "None";
//     },
//     { once: false }
//   );
// };
