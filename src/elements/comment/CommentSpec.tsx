import {
  createCustomDropdownField,
  createCustomField,
} from "../../plugin/fieldViews/CustomFieldView";
import { createTextField } from "../../plugin/fieldViews/TextFieldView";
import { createReactElementSpec } from "../../renderers/react/createReactElementSpec";
import { undefinedDropdownValue } from "../membership/MembershipSpec";
import { CommentElementForm } from "./CommentForm";

export const commentFields = {
  source: createTextField(),
  discussionKey: createTextField(),
  role: createCustomDropdownField(undefinedDropdownValue, [
    { text: "inline (default)", value: undefinedDropdownValue },
    { text: "supporting", value: "supporting" },
    { text: "showcase", value: "showcase" },
    { text: "thumbnail", value: "thumbnail" },
    { text: "immersive", value: "immersive" },
  ]),
  commentUrl: createTextField(),
  originalUrl: createTextField(),
  height: createTextField({ absentOnEmpty: true }),
  sourceUrl: createTextField(),
  discussionUrl: createTextField(),
  authorUrl: createTextField(),
  html: createTextField({ absentOnEmpty: true }),
  width: createTextField(),
  authorName: createTextField(),
  commentId: createTextField(),
  isMandatory: createCustomField(true, true),
};

export const commentElement = createReactElementSpec(
  commentFields,
  CommentElementForm
);
