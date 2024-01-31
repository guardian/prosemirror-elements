---
"@guardian/prosemirror-elements": major
---

Add more controls over repeater child nodes
- Breaking change: repeater `add` and `remove` methods have been renamed. Use `addChildAfter` and `removeChildAt` instead. 
- Note that `addChildAfter` now always requires an index. 
To add to the start of the repeater, use `-1` as the index. 
To add to the end of the repeater, use the `addChildAtEnd` method.
- You can now move child nodes up and down using the `moveChildUpOne` and `moveChildDownOne` methods.
- You can specify the minimum number of children that a repeater must have using the `minChildren` option - this defaults to zero.
- The `AltStyleElementForm` has been updated to reflect these new controls.