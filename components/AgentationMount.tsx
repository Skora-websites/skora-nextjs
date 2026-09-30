"use client";

import React, { useSyncExternalStore } from "react";
import { Agentation } from "agentation";

// Hydration-safe "are we on the client yet": the server snapshot is false, so
// the toolbar is never part of the SSR HTML, and React flips it after hydration
// without a setState inside an effect.
const subscribe = () => () => void 0;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Dev-only visual annotation toolbar — https://agentation.dev
 *
 * Renders nothing in production and nothing during SSR, so the library's DOM
 * access never runs on the server and there is no hydration mismatch.
 * Annotations sync to the local MCP server on :4747, registered in
 * `opencode.json` — drop a note on the page, then ask the agent to list
 * pending feedback.
 *
 * Mounted in `app/layout.tsx` outside `SmoothScroll`, so the toolbar is never
 * caught inside the scroller's transformed wrapper.
 */
export default function AgentationMount() {
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (process.env.NODE_ENV !== "development" || !isClient) return null;

  return <Agentation endpoint="http://localhost:4747" appName="Skora" />;
}
