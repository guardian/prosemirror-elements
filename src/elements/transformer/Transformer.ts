import type { FieldNameToValueMap } from "../../plugin/fieldViews/helpers";
import type { FieldDescriptions } from "../../plugin/types/Element";

export type TransformIn<
  ExternalData,
  FDesc extends FieldDescriptions<string>
> = (data: ExternalData) => Partial<FieldNameToValueMap<FDesc>>;

export type TransformOut<
  ExternalData,
  FDesc extends FieldDescriptions<string>
> = (data: FieldNameToValueMap<FDesc>) => ExternalData;

export type ExtractTransformParameter<T> = T extends (arg: any) => any
  ? Parameters<T>[0]
  : unknown;

export type ExtractTransformReturnType<T, U> = T extends (arg: any) => any
  ? ReturnType<T>
  : U;
