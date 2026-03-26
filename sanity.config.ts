import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schema";
import { rebuildSiteAction } from "./sanity/actions/rebuild-site";

export default defineConfig({
  name: "sipshield",
  title: "SipShield",
  projectId: "vuojv6bg",
  dataset: "production",
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev) => [...prev, rebuildSiteAction],
  },
});
