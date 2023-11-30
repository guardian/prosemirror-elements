---
"@guardian/prosemirror-elements": major
---

Refactor createReactElementSpec interface to options object arg

This change has been made because we now have multiple optional arguments, and might want to specify only the last one.

It also add a new argument to the options object, 'wrapperComponent' - which allows developers to provide their own wrapper e.g. with different styles.