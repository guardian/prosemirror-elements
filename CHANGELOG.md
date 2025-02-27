# @guardian/prosemirror-elements

## 9.6.9

### Patch Changes

- 4cd0626: Improve performance in large articles containing many elements
- b511c60: Do not render element decorations unless necessary, improving performance in large documents

## 9.6.8

### Patch Changes

- 0c6bd3b: Improve performance in large articles containing many elements

## 9.6.7

### Patch Changes

- 4568680: Improve handling of decorations, especially in nested and repeater fields

## 9.6.6

### Patch Changes

- 4e8f152: Use Composer's standard redo shortcut rather than Mod-y

## 9.6.5

### Patch Changes

- fff9bd7: Fix bullet lists in rich text fields and release fix for mark button clicking

## 9.6.4

### Patch Changes

- 3427374: Bumps prosemirror-transform to sort issue with bullet lists in rich text fields
- 031f8db: Fix selection error when backwards selections cover fields (#410)

## 9.6.3

### Patch Changes

- bcfd8fe: Pass stored marks to element fields from outer editor (fixing problem with guardian/prosemirror-noting)

## 9.6.2

### Patch Changes

- d480886: Fix bug for elements changes that start at pos 0

## 9.6.1

### Patch Changes

- 2fc82a8: Handle selection changes passed from outer editor in ProseMirrorFieldViews

## 9.6.0

### Minor Changes

- 9bf0077: Fix element movement near repeater elements

### Patch Changes

- 6c37c7a: Fix element movement near list els and stop outer editor controlling scroll

## 9.5.1

### Patch Changes

- 78a5731: Adds basic animations to list elements

## 9.5.0

### Minor Changes

- 3d8f778: Make addChildAfter optional for RightActionControls

## 9.4.0

### Minor Changes

- 878f142: Export AltStyleWrapper and support inline field titles

## 9.3.2

### Patch Changes

- 0201c04: Exports required styles and controls required by the timeline element

## 9.3.1

### Patch Changes

- cac755b: Remove double border between nested fields and text fields

## 9.3.0

### Minor Changes

- 4e42b5e: Update required validation to support fields containing arrays

## 9.2.7

### Patch Changes

- 4ae3097: Do not coerce HTML nodes without field attributes to a field value of {}

## 9.2.6

### Patch Changes

- b7c63fa: Improve spacing for alt style wrapper and nestedElement fields

## 9.2.5

### Patch Changes

- 55c6ff4: Fix scrolling to top of element on undo in element field

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
