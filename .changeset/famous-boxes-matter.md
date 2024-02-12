---
"@guardian/prosemirror-elements": major
---

Serialise nested elements as array of element objects, not a string of html.

This will require a refactoring of how the Key Takeaways element is handled by apiv2 in flexible-content.

The nested element field will now apply transformations to the elements its handled, based on functions passed in from the consumer (e.g. composer)