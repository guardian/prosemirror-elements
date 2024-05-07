/**
 * Note: this file has been lifted directly from:
 * https://github.com/formkit/auto-animate/blob/master/src/react/index.ts
 * This is because our project doesn't get along with the standard React implementation of
 * auto-animate, which is described here:
 * https://auto-animate.formkit.com/#usage-react
 * This has something to do with the unusual import syntax (note the /react subdirectory):
 * > import { useAutoAnimate } from '@formkit/auto-animate/react'
 * So as a workaround to avoid using this syntax, I made the decision to just copy the
 * implementation of the hook here.
 */
import type {
  AnimationController,
  AutoAnimateOptions,
  AutoAnimationPlugin,
} from "@formkit/auto-animate";
import autoAnimate from "@formkit/auto-animate";
import type { RefCallback } from "react";
import { useCallback, useMemo, useState } from "react";

/**
 * AutoAnimate hook for adding dead-simple transitions and animations to react.
 * @param options - Auto animate options or a plugin
 * @returns
 */
export function useAutoAnimate<T extends Element>(
  options?: Partial<AutoAnimateOptions> | AutoAnimationPlugin
): [RefCallback<T>, (enabled: boolean) => void] {
  const [controller, setController] = useState<
    AnimationController | undefined
  >();
  const memoizedOptions = useMemo(() => options, []);
  const element = useCallback(
    (node: T) => {
      if (node instanceof HTMLElement) {
        setController(autoAnimate(node, memoizedOptions));
      } else {
        setController(undefined);
      }
    },
    [memoizedOptions]
  );
  const setEnabled = useCallback(
    (enabled: boolean) => {
      if (controller) {
        enabled ? controller.enable() : controller.disable();
      }
    },
    [controller]
  );

  return [element, setEnabled];
}
