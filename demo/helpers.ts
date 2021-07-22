import type { SetMedia } from "../src/elements/demo-image/DemoImageElement";

export const onGridMessage = (setMedia: SetMedia, modal: HTMLElement) => ({
  data,
}: {
  data: {
    image: {
      data: {
        id: string;
      };
    };
    crop: {
      data: {
        specification: {
          uri: string;
        };
        assets: Array<{ secureUrl: string }>;
      };
    };
  };
}) => {
  modal.style.display = "None";
  setMedia(
    data.image.data.id,
    data.crop.data.specification.uri,
    data.crop.data.assets.map((_) => _.secureUrl)
  );
};

export const onSelectImage = (setMedia: SetMedia) => {
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

export const onCropImage = (mediaId: string, setMedia: SetMedia) => {
  const modal = document.querySelector(".modal") as HTMLElement;
  modal.style.display = "Inherit";

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = `https://media.test.dev-gutools.co.uk/images/${mediaId}`;

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
