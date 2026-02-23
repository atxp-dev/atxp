import { build } from "esbuild";

await build({
  entryPoints: ["dist/server.js"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/server.bundle.js",
  external: ["child_process", "fs", "os", "path"],
});
