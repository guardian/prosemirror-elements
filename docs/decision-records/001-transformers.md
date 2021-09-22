# ADR: Managing the transformation between pm-elements and consumer element representations
## Context

The type of data representing elements in consumers may differ from the type of data native to prosemirror-elements elements. This is the case at the Guardian, where our document format (flexible-model) has an element definition that doesn’t correspond with the elements we define with prosemirror-elements.

This is always likely to be the case – there’s usually a difference between data as it’s represented in a model, and data represented in forms designed to feed that model.

As a result, currently prosemirror-elements has a `transformIn` and `transformOut` API, that allows consumers to include the transformation between external and internal types in their element.

As we worked with this API, a few concerns were raised:

- It makes our types harder to reason about, both in terms of writing them, and in terms of reasoning about them as a consumer when things go wrong.
- Reasoning about partial representations of external data, and hydrating to their complete or partial internal counterparts felt complex.
- Coupling the definition of our element with a particular set of data requirements for a particular consumer felt arbitrary.

Ultimately, these concerns led us to explore alternatives to this approach.

## Options

1. Keep things as they are, and make do with increased complexity.
2. Remove the transformers API, and make it the consumer’s responsibility to do this work.

## Decision

We decided to remove the transformers API, and make it the consumer’s responsibility to do this work.

## Consequences

- Reduced complexity within the prosemirror-elements library.
- (Guardian-specific) We’ll need to implement the logic necessary for these transformations elsewhere.





