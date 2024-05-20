import React from "react";
import { DemoFieldWrapper } from "../../editorial-source-components/DemoFieldWrapper";
import { FieldLayoutVertical } from "../../editorial-source-components/FieldLayout";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { repeaterElementFields } from "./RepeaterElement";

export const AddRepeaterButtonId = "AddRepeaterButton";
export const AddNestedRepeaterButtonId = "AddNestedRepeaterButton";
export const RemoveRepeaterButtonId = "RemoveRepeaterButton";
export const RemoveNestedRepeaterButtonId = "RemoveNestedRepeaterButton";

export const repeaterElement = createReactElementSpec({
  fieldDescriptions: repeaterElementFields,
  component: ({ fields }) => (
    <FieldLayoutVertical>
      <ul>
        {fields.repeater.children.map((repeater, index) => (
          <li key={repeater.__ID}>
            <DemoFieldWrapper
              headingLabel="Repeater text"
              headingContent={
                <>
                  <button
                    data-cy={RemoveRepeaterButtonId}
                    onClick={() => fields.repeater.view.removeChildAt(index)}
                  >
                    -
                  </button>
                  <button
                    data-cy={AddRepeaterButtonId}
                    onClick={() => fields.repeater.view.addChildAfter(index)}
                  >
                    +
                  </button>
                </>
              }
              field={repeater.repeaterText}
            />
            <ul>
              {repeater.nestedRepeater.children.map((nestedRepeater, index) => (
                <li key={nestedRepeater.__ID}>
                  <DemoFieldWrapper
                    headingLabel="Nested repeater text"
                    headingContent={
                      <>
                        <button
                          data-cy={RemoveNestedRepeaterButtonId}
                          onClick={() =>
                            repeater.nestedRepeater.view.removeChildAt(index)
                          }
                        >
                          -
                        </button>
                        <button
                          data-cy={AddNestedRepeaterButtonId}
                          onClick={() =>
                            repeater.nestedRepeater.view.addChildAfter(index)
                          }
                        >
                          +
                        </button>
                      </>
                    }
                    field={nestedRepeater.nestedRepeaterText}
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </FieldLayoutVertical>
  ),
});
