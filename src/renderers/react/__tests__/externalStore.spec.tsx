import { act, render, screen } from "@testing-library/react";
import { createStore } from "../externalStore";

describe("createStore", () => {
  it("should provide an initial value", () => {
    const { Store } = createStore(1);

    render(<Store>{(value) => <>{value}</>}</Store>);

    expect(screen.getByText("1")).toBeTruthy();
  });

  it("should update that value when called, returning true", () => {
    const { Store, update } = createStore(1);

    render(<Store>{(value) => <>{value}</>}</Store>);
    act(() => {
      const hasUpdated = update(2);
      expect(hasUpdated).toBe(true);
    });

    expect(screen.getByText("2")).toBeTruthy();
  });

  it("should update multiple components", () => {
    const { Store, update } = createStore(1);

    render(
      <>
        <div>
          <Store>{(value) => <>{value}</>}</Store>
        </div>
        <div>
          <Store>{(value) => <>{value}</>}</Store>
        </div>
      </>
    );
    act(() => {
      update(2);
    });

    expect(screen.getAllByText("2").length).toBe(2);
  });

  it("should unsubscribe from the store when the Store component is unmounted, returning false when `update` is called", () => {
    const { Store, update } = createStore(1);

    const { unmount } = render(<Store>{(value) => <>{value}</>}</Store>);

    expect(screen.getByText("1")).toBeTruthy();

    unmount();

    expect(update(1)).toBe(false);
  });
});
