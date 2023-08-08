import type { Element } from "../cartoonDataTransformer";
import { transformElement } from "../cartoonDataTransformer";

describe("cartoon element transform", () => {
  describe("transformIn", () => {
    it("should not allow elements which are the wrong type", () => {
      // @ts-expect-error -- we should not be able to transform a malformed element
      expect(() => transformElement.in({})).toThrow;
      expect(() =>
        transformElement.in({
          assets: [],
          // @ts-expect-error -- we should not be able to transform a malformed element
          fields: { nonExistantField: "123" },
        })
      ).toThrow;
    });
    it("should transform elements correctly", () => {
      const element: Element = {
        elementType: "cartoon",
        fields: {
          photographer: "Oliva Hemingway",
          caption: "Photo of a dog",
          alt: "Photo of a dog",
          source: "PA",
          displayCredit: true,
          variants: [
            {
              viewportSize: "large",
              images: [
                {
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/large.jpg",
                  width: 200,
                  height: 200,
                  mediaId: "123",
                },
              ],
            },
            {
              viewportSize: "small",
              images: [
                {
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/small.jpg",
                  width: 100,
                  height: 100,
                  mediaId: "456",
                },
              ],
            },
          ],
        },
        assets: [],
      };

      expect(transformElement.in(element)).toEqual({
        role: "none-selected",
        photographer: "Oliva Hemingway",
        source: "PA",
        caption: "Photo of a dog",
        alt: "Photo of a dog",
        displayCredit: true,
        imageType: "Illustration",
        largeImages: [
          {
            mimeType: "image/jpeg",
            file: "https://media.guim.co.uk/large.jpg",
            width: 200,
            height: 200,
            mediaId: "123",
          },
        ],
        smallImages: [
          {
            mimeType: "image/jpeg",
            file: "https://media.guim.co.uk/small.jpg",
            width: 100,
            height: 100,
            mediaId: "456",
          },
        ],
      });
    });
    describe("transformOut", () => {
      it("should not allow elements which are the wrong type", () => {
        // @ts-expect-error -- we should not be able to transform a malformed element
        expect(() => transformElement.out({})).toThrow;
        expect(() =>
          transformElement.out({
            // @ts-expect-error -- we should not be able to transform a malformed element
            nonExistantField: "123",
          })
        ).toThrow;
      });
      it("should transform elements out correctly", () => {
        const element = {
          role: "none-selected",
          photographer: "Oliva Hemingway",
          source: "PA",
          alt: "Photo of a dog",
          displayCredit: true,
          caption: "Photo of a dog",
          imageType: "Illustration",
          largeImages: [
            {
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/large.jpg",
              width: 200,
              height: 200,
              mediaId: "123",
            },
          ],
          smallImages: [
            {
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/small.jpg",
              width: 100,
              height: 100,
              mediaId: "456",
            },
          ],
        };

        expect(transformElement.out(element)).toEqual({
          elementType: "cartoon",
          fields: {
            alt: "Photo of a dog",
            caption: "Photo of a dog",
            source: "PA",
            photographer: "Oliva Hemingway",
            displayCredit: true,
            imageType: "Illustration",
            variants: [
              {
                viewportSize: "small",
                images: [
                  {
                    mimeType: "image/jpeg",
                    file: "https://media.guim.co.uk/small.jpg",
                    width: 100,
                    height: 100,
                    mediaId: "456",
                  },
                ],
              },
              {
                viewportSize: "large",
                images: [
                  {
                    mimeType: "image/jpeg",
                    file: "https://media.guim.co.uk/large.jpg",
                    width: 200,
                    height: 200,
                    mediaId: "123",
                  },
                ],
              },
            ],
          },
          assets: [],
        });
      });
    });
  });
});
