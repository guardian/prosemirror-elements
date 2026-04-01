# @guardian/prosemirror-elements

A [ProseMirror](https://prosemirror.net/) plugin that makes modeling arbitrary nested content simple. It allows structured, non-text content to be modelled as first-class citizens of the ProseMirror schema. We call this content elements.

## Contents

- [Introduction](#1-introduction)
- [Getting Started](#2-getting-started)
- [How It Works](#3-how-it-works)
- [Useful Links](#4-useful-links)
- [Terminology](#5-terminology)

## 1. Introduction

Modelling non-text content in ProseMirror can be tricky. `prosemirror-elements` provides an abstraction that makes it easy to write custom elements that:

- Contain user-defined fields that model many different kinds of content, including rich text, plain text, dropdowns, checkboxes, repeating groups, and arbitrary custom data.
- Are first-class citizens of the ProseMirror schema — nested rich text fields participate fully in collaborative editing, selections, decorations, and marks.
- Are renderer-agnostic — React bindings are provided as a default, but the core is framework-independent.

The library is used by Guardian editorial tools to power structured content such as images, pullquotes, callouts, embeds, recipes, and more.

> **Note for Guardian developers:** Many element definitions used in Composer have been moved into the [flexible-content](https://github.com/guardian/flexible-content) repo (see [PR #4410](https://github.com/guardian/flexible-content/pull/4410)). If you are making a change intended for Composer, make the changes there instead.

## 2. Getting Started

### Setup

1. Ensure you have `dev-nginx` and `yarn` installed on your local machine.
2. Run the setup script: `./script/setup.sh`

### Running locally

1. Ensure nginx is running.
2. `yarn start` builds the project locally, spins up a webserver on https://prosemirror-elements.local.dev-gutools.co.uk, and watches for file changes.

## Testing

- Run the unit tests via Jest with `yarn test:unit`.
- Run the integration tests via Cypress with `yarn test:integration`.
  - You'll need to be running the application via `yarn start` simultaneously for the tests to work – make sure the server is responding on http://localhost:7890 before running the tests.
  - For reasons we're not yet able to determine, Cypress won't run your tests immediately when you select them in the GUI. Hit the 'refresh' button and they should run normally.

### Releasing

This repository uses [changesets](https://github.com/changesets/changesets) for version management.

1. Run `yarn changeset add` and follow the prompts to create a changeset file.
2. Commit the changeset file with your PR.
3. When merged, Changesets will open a release PR. Approve and merge it to publish to npm.

### Testing locally in consuming applications

We recommend [yalc](https://github.com/wclr/yalc) for testing local changes:

1. Install yalc globally: `npm i yalc -g` or `yarn global add yalc`.
2. Build and push to yalc: `yarn yalc`
3. In the consuming project: `yalc add @guardian/prosemirror-elements`

Re-run `yarn yalc` in this repo after each local change.

> **Why not `yarn link`?** ProseMirror and its dependencies sometimes use `instanceof` checks. `yarn link` can cause duplicate dependency copies, breaking these checks. See the [Troubleshooting](#troubleshooting) section for a known workaround.

### Adding a new element

See the [Quick-Start Guide](docs/quick-start.md) for a step-by-step walkthrough of creating an element with fields and a React UI.

## 3. How It Works

### Overview

For an explanation of the plugin's core funcitonality, see [How prosemirror-elements works](docs/how-it-works.md).

### Core technologies

- **[ProseMirror](https://prosemirror.net/)** — the underlying rich-text editor framework.
- **TypeScript** — the project is written entirely in TypeScript.

### Architecture

The project is structured into three main areas:

- **`src/plugin/`** — The core ProseMirror plugin: field definitions, node spec generation, field views, validation helpers, and the plugin itself.
- **`src/renderers/react/`** — React bindings — `createReactElementSpec`, field components, stores, and wrapper controls.
- **`src/elements/`** — Built-in element definitions (e.g. image, pullquote, callout, embed, tweet, table, recipe, code, etc.). These are included for reference and no longer used in production.

## 4. Useful Links

- [Quick-Start Guide](docs/quick-start.md) — creating your first element
- [How prosemirror-elements works](docs/how-it-works.md) — detailed technical walkthrough
- [Vision](docs/vision.md) — project goals and design philosophy
- [ADRs](docs/decision-records/) – significant decision which were made during project development
- [ProseMirror documentation](https://prosemirror.net/docs/) 

## 5. Terminology

- **Element** — A structured, non-text content block within a ProseMirror document (e.g. an image, pullquote, or embed). Composed of one or more Fields.
- **Field** — A single data unit within an Element. Field types include text, rich text, custom, dropdown, checkbox, repeater, and nested element.
- **Field View** — The ProseMirror view-layer representation of a Field — manages how a field is rendered and how user input is captured.
- **NodeSpec** — A ProseMirror schema definition for a node type. `prosemirror-elements` generates NodeSpecs from element and field definitions. [ProseMirror documentation](https://prosemirror.net/docs/ref/#model.NodeSpec)
- **Content Expression** — A ProseMirror string that defines what child nodes a node may contain (e.g. `"block+"`, `"text*"`). [ProseMirror documentation](https://prosemirror.net/docs/guide/#schema.content_expressions).
- **Repeater Field** — A field type that allows zero or more repeated groups of child fields (e.g. a list of books, each with title and ISBN).
- **Custom Field** — A field that stores arbitrary data as ProseMirror node attributes rather than document content. Updates are always last-write-wins.
- **Element Spec** — The combination of a field description object and a renderer component that together define an element.
- **Data Transformer** — A function that converts between an element's external data representation (plain JS object) and its internal ProseMirror node representation.

## Troubleshooting

### Problems with `yarn link`

ProseMirror and its dependencies sometimes use object identity checks (e.g. `instanceof`). When using `yarn link`, it's possible for the consuming code to bundle different versions of dependencies simultaneously. This can be difficult to work around. It will not happen during a normal install.

We recommend using `yalc` to avoid this issue, but it's also possible to work around it.

One known instance of this occurs when appending the `NodeSpec` generated by the library to the parent editor schema. This would normally be accomplished by appending it to a parent schema, like so:

```ts
const mySchema = new Schema({
  nodes: OrderedMap.from(schema.spec.nodes).append(nodeSpec),
  marks,
});
```

This may fail if your bundler has included the `ordered-map` dependency twice in your project. Because `ordered-map` uses `instanceof` to determine if an incoming object is an `OrderedMap`, the incoming object will fail this check, despite it being the correct shape.

As a workaround, try reconstructing the map as an object:

```ts
const objectNodeSpec: Record<string, NodeSpec> = {};
nodeSpec.forEach((key, value) => (objectNodeSpec[key] = value as NodeSpec));

const mySchema = new Schema({
  nodes: OrderedMap.from(schema.spec.nodes).append(objectNodeSpec),
  marks,
});
```

