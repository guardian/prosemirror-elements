import { h, render, VNode } from "preact";
import mount from "../../mount";
import EmbedProvider from "./EmbedProvider";

export default mount<VNode>(
  (consume, dom, updateState, fields, commands, subscribe) =>
    render(
      <EmbedProvider
        subscribe={subscribe}
        onStateChange={updateState}
        fields={fields}
        commands={commands}
        consume={consume}
      />,
      dom
    )
);
