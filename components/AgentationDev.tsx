"use client";

import { Agentation as AgentationComponent } from "agentation";

/**
 * Dev-only visual annotation overlay for Agentation.
 *
 * - Rendered nowhere on the server (guarded by NODE_ENV check), so it is
 *   fully excluded from production bundles.
 * - "use client" + mounted check keeps SSR/hydration happy.
 */
export default function AgentationDev() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <AgentationComponent
      endpoint={process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT ?? "http://localhost:4747"}
    />
  );
}
