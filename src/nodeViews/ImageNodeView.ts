import { BaseSubscriberNodeView } from "./BaseSubscriberNodeView";

export type ImageFields = { src: string };

/**
 * A NodeView (https://prosemirror.net/docs/ref/#view.NodeView) representing a
 * Guardian image.
 */
export class ImageNodeView extends BaseSubscriberNodeView<ImageFields> {
  public static propName = "image" as const;
  public static defaultValue = { src: "" };
}
