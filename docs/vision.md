# Challenges

1. Nesting arbitrary content within ProseMirror 
2. Seamlessly integrating nested ProseMirror rich-text fields with the parent instance
3. Providing a way to create any possible custom nested element
4. Abstracting ProseMirror core functionality and  offering a simple interface

# Vision

The goal of the ProseMirror-Elements plugin is to provide a logical extension to ProseMirror's core functionality that makes modeling arbitrary nested content simple. It should be easy to understand, easy to implement and agnostic about the elements that use it.

## Easy to understand

Creating new elements with the plugin should require minimal understanding of the ProseMirror ecosystem and the plugin itself. It should abstract the complexity of adding nested content and provide developers with a clear intuitive interface.

The plugin should provide an API that’s minimal and idiomatic, with opinionated defaults for common operations, and powerful escape hatches when consumers need something that strays off that path.

#### KPIs

- Consistent interface that's intuitive to understand
- Succinct API that provides a powerful set of controls
- Documentation that explains any areas that are unclear
- Test environment allowing developers to quickly play around with the plugin


## Easy to implement

Adding the plugin to a new or existing project should be seamless and quickly show results. Once users have set the plugin up, they should be able to easily develop and add new elements.

#### KPIs

- Possible to implement into a ProseMirror instance quickly
- Creating new elements can be done by people unfamiliar to ProseMirror
- Elements with varying requirements and complexity can be implemented using the plugin

## Agnostic

The plugin should have no opinion about the elements that use it. Any complexity necessary to implement an element should be possible without increasing the surface area of the API.

#### KPIs

- Plugin should have no stake in implemented elements

## Collaborative Editing

The plugin should present no barrier to collaborative editing. Parent instances which implement collaborative editing should provide nested content with similar functionality in all relevant fields.

#### KPIs

- Collaborative editing should be easy to implement

## Accessibility 

While the plugin is agnostic about the elements that use it, it should be easy to create elements that meet our [accessibility standards](https://docs.google.com/document/d/1mCPo4U3U57IC869AKWiEylpGjyRnT5NVYlL8gOkCEOk/edit). 

#### KPIs

- Is it easy to implement new elements that meet our accessibility standard?
