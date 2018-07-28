import { h, render, VNode } from 'preact';
import mount from '../../mount';
import EmbedProvider from './EmbedProvider';

export default mount<VNode>((dom, initState, consume, subscribe) =>
  render(
    <EmbedProvider
      initState={initState}
      subscribe={subscribe}
      consume={consume}
    />,
    dom
  )
);
