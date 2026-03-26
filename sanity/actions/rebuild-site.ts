import { useCallback, useState } from "react";
import type { DocumentActionComponent } from "sanity";

/**
 * Sanity Studio document action that triggers a Netlify site rebuild.
 * Placeholder until NETLIFY_BUILD_HOOK_URL is configured.
 */
export const rebuildSiteAction: DocumentActionComponent = () => {
  const [status, setStatus] = useState<"idle" | "rebuilding" | "done" | "error">("idle");

  const onHandle = useCallback(async () => {
    const hookUrl = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK;
    if (!hookUrl) {
      setStatus("error");
      return;
    }

    setStatus("rebuilding");

    try {
      await fetch(hookUrl, { method: "POST" });
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, []);

  return {
    label:
      status === "rebuilding"
        ? "Rebuilding…"
        : status === "done"
          ? "Rebuild triggered!"
          : status === "error"
            ? "Rebuild failed (check hook URL)"
            : "Rebuild Site",
    onHandle,
    tone: status === "error" ? "critical" : status === "done" ? "positive" : "default",
    disabled: status === "rebuilding",
  };
};
