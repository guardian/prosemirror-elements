# @guardian/prosemirror-elements

This Prosemirror plugin adds the ability to add custom 'elements' to a document.

## Why does this exist?

Modelling non-text content in Prosemirror can be tricky. `prosemirror-elements` provides an abstraction that makes it easy to write custom elements that:

- contain user-defined fields that model many different kinds of content, including rich text fields and arbitrary data
- are first class citizens of the Prosemirror schema (for example, nested rich text fields play nicely with collaborative editing)
- are renderer-agnostic (we use React as a default)

## Setup

`yarn` installs and sets up the project dependencies.

## Run

`yarn start` builds the project locally, spins up a webserver on http://localhost:7890, and watches for file changes.

## Testing

- Run the unit tests via Jest with `yarn test:unit`.
- Run the integration tests via Cypress with `yarn test:integration`.
  - You'll need to be running the application via `yarn start` simultaneously for the tests to work – make sure the server is responding on http://localhost:7890 before running the tests.
  - For reasons we're not yet able to determine, Cypress won't run your tests immediately when you select them in the GUI. Hit the 'refresh' button and they should run normally.
