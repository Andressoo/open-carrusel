// Browser stub · prevents Turbopack from bundling server-only Remotion packages
// (@remotion/bundler, @remotion/renderer) which have native deps (esbuild, chromium).
// These are only used in /api/render (Node server route).
export {};
