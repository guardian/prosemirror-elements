import { render, waitFor } from "@testing-library/react";
import { TrackingStatusChecks } from "../ThirdPartyStatusChecks";

describe("Third party status checks", () => {
  it("calls the callback with the original element HTML after a debounce", async () => {
    const exampleHtml = "<p>Example html</p>";
    const checkTrackingMock = jest.fn().mockReturnValue(Promise.resolve());

    render(
      <TrackingStatusChecks
        html={exampleHtml}
        checkThirdPartyTracking={checkTrackingMock}
        isMandatory={false}
      ></TrackingStatusChecks>
    );

    expect(checkTrackingMock.mock.calls[0]).toEqual(undefined);

    await waitFor(
      () => {
        expect(checkTrackingMock.mock.calls[0]).toEqual([exampleHtml]);
      },
      { timeout: 2000 }
    );
  });
});
