## Challenges

1. Nesting arbitrary collections of content within ProseMirror
2. Seamlessly integrating nested ProseMirror rich-text fields with the parent instance
3. Abstracting ProseMirror core functionality and offering a simple interface

## Vision

The goal of the ProseMirror-Elements plugin is to provide a logical extension to ProseMirror's core functionality that makes modeling arbitrary nested content simple. It should be easy to understand, easy to implement and agnostic about the elements that use it.

## Goals

### Easy to use

Creating new elements with the plugin should require minimal understanding of the ProseMirror ecosystem and the plugin itself. It should abstract the complexity of adding nested content and provide developers with a clear intuitive interface.

The plugin should provide an API that’s minimal and consistent, with opinionated defaults for common operations, and powerful escape hatches when consumers need something that strays off that path. The documentation should be comprehensive. We should consider a sandbox environment that lets users experiment with field declarations.

#### KPIs

- Few issues raised against this library to explain core functionality
- The time between beginning to use the library and creating useful elements is minimal
- The surface area of the API should be as small as possible for the feature set

### Flexible

It should be possible for users to express complex data and UI requirements with `prosemirror-elements`.

#### KPIs

- Feedback from consumers that the plugin has met their data and UI needs

### Agnostic

The plugin should have no opinion about the elements that use it, or how they are displayed. Any complexity necessary to implement an element should be possible without increasing the surface area of the API.

#### KPIs

- Few requests to expand API
- Possible to use arbitrary UI frameworks

### Seamless integration with Prosemirror

Fields modelled in prosemirror-elements should integrate as seamlessly with Prosemirror as possible. Content should be modelled in a way which matches the Prosemirror schema as closely as possible. Marks and decorations from the parent editor should be available in fields that model text. 

The plugin should present no barrier to collaborative editing. Parent instances which implement collaborative editing should be able to provide nested content with similar functionality in all relevant fields.

#### KPIs

- Any functionality which depends on marks or decorations, should 'just work'
- The structure of an element should be easily understandable by inspecting the document content, perhaps with the Prosemirror developer tools

### Accessibility 

While the plugin is agnostic about the elements that use it, it should be easy to create elements that meet our [accessibility standards](https://docs.google.com/document/d/1mCPo4U3U57IC869AKWiEylpGjyRnT5NVYlL8gOkCEOk/edit). 

#### KPIs

- The elements that are made from this library can be easily made accessible
