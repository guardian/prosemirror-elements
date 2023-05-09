import type { Schema } from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import type { Options } from "../../../plugin/fieldViews/DropdownFieldView";
import type { Image } from "../../cartoon/cartoonDataTransformer";
import type { Asset } from "../defaultTransform";

export type MediaPayload = {
  mediaId: string;
  mediaApiUri: string;
  assets: Asset[];
  suppliersReference: string;
  caption: string;
  photographer: string;
  source: string;
};

export type SetMedia = (mediaPayload: MediaPayload) => void;

export type MainImageData = {
  mediaId?: string | undefined;
  mediaApiUri?: string | undefined;
  assets: Asset[];
  suppliersReference?: string;
  caption?: string;
};

export type ImageSelector = (setMedia: SetMedia, mediaId?: string) => void;

export type ImageElementOptions = {
  openImageSelector: ImageSelector;
  createCaptionPlugins?: (schema: Schema) => Plugin[];
  additionalRoleOptions: Options;
};

export type SetImage = (image: Image) => void;
export type CartoonImageSelector = (
  setImage: SetImage,
  mediaId?: string
) => void;
