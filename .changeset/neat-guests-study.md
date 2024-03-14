---
"@guardian/prosemirror-elements": patch
---

Always update fieldViews for nestedElement fields, in order to fix
a problem related to our zipRoot plugin in Composer, where joining
text elements within a nestedElement causes the document to enter
an invalid state, unless the fieldViews are updated again.
