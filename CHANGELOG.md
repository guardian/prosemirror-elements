# @guardian/prosemirror-elements

## 9.2.4

### Patch Changes

- 232897d: Use stable identifier for nestedFields in fieldView update workaround

## 9.2.3

### Patch Changes

- 688efd8: propagate key down & press events upwards from NestedElementFieldView up to the top-level editor so key mappings work as expected

## 9.2.2

### Patch Changes

- 38d2b63: Always update fieldViews for nestedElement fields, in order to fix
  a problem related to our zipRoot plugin in Composer, where joining
  text elements within a nestedElement causes the document to enter
  an invalid state, unless the fieldViews are updated again.

## 9.2.1

### Patch Changes

- d66d6f0: Only show element controls on hover or focus

## 9.2.0

### Minor Changes

- 1bf3be3: Improve visual hierarchy of element controls

## 9.1.1

### Patch Changes

- 50cdc4b: Fix decoration bug in nestedFields within repeater fields

## 9.1.0

### Minor Changes

- 0414a91: Widen alt style element

## 9.0.1

### Patch Changes

- 68de686: Fix bug with text element serialisation in nestedElement field

## 9.0.0

### Major Changes

- ca67b4d: Serialise nested elements as array of element objects, not a string of html.

  This will require a refactoring of how the Key Takeaways element is handled by apiv2 in flexible-content.

  The nested element field will now apply transformations to the elements its handled, based on functions passed in from the consumer (e.g. composer)

## 8.0.1

### Patch Changes

- be51732: Enforce repeater has minChildren nodes in schema

## 8.0.0

### Major Changes

- d2934d1: Add more controls over repeater child nodes
  - Breaking change: repeater `add` and `remove` methods have been renamed. Use `addChildAfter` and `removeChildAt` instead.
  - Note that `addChildAfter` now always requires an index.
    To add to the start of the repeater, use `-1` as the index.
    To add to the end of the repeater, use the `addChildAtEnd` method.
  - You can now move child nodes up and down using the `moveChildUpOne` and `moveChildDownOne` methods.
  - You can specify the minimum number of children that a repeater must have using the `minChildren` option - this defaults to zero.
  - The `AltStyleElementForm` has been updated to reflect these new controls.

## 7.1.1

### Patch Changes

- 3332b8c: - Bumping changeset version to resolve high vulnerabilities
  - Support typerighter in repeater nodes by default
  - Add minimum rows option for nestedElementField
  - Fix typerighter elements bug (show more than one decoration per typerighter-supporting field) and get decorations working better in repeated nested fields

## 7.1.0

### Minor Changes

- 22f3ec2: Add the nestedElement field, a rich text editor that supports elements.

## 7.0.0

### Major Changes

- 0e53c09: Refactor createReactElementSpec interface to options object arg

  This change has been made because we now have multiple optional arguments, and might want to specify only the last one.

  It also add a new argument to the options object, 'wrapperComponent' - which allows developers to provide their own wrapper e.g. with different styles.

## 6.1.0

### Minor Changes

- 98d9918: Add repeater field to package exports

## 6.0.1

### Patch Changes

- 66f5710: Test release
