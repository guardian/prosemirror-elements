# @guardian/prosemirror-elements

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
