import path from "path";
import rimraf from "rimraf";
import svelte from "rollup-plugin-svelte";
import { nodeResolve as resolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import url from "@rollup/plugin-url";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import babel from "@rollup/plugin-babel";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import consts from "./rollupPlugins/consts";
import html from "./rollupPlugins/html";
import minifyHtml from "./rollupPlugins/minifyHtml";

rimraf.sync("dist");

const production = process.env.NODE_ENV === "production";
const opt = process.env.OPT === "true";

if (production) {
  // eslint-disable-next-line no-console
  console.log("\nCreating an optimized production build...");
}

const postcssOptions = {
  autoModules: true,
  plugins: [autoprefixer],
  extract: true,
  minimize: production && opt,
  modules: {
    generateScopedName:
      production && opt
        ? "s[hash:base64:5]"
        : "[name]__[local]__[hash:base64:5]",
  },
};

export default {
  input: "frontend/index.js",
  output: {
    sourcemap: !production,
    format: "es",
    name: "app",
    dir: "dist",
  },
  plugins: [
    svelte({
      compilerOptions: {
        // Enable run-time checks when not in production
        dev: !production,
      },
    }),

    resolve({ browser: true, dedupe: ["svelte"] }),
    commonjs(),
    postcss(postcssOptions),
    url({
      include: [
        "**/*.svg",
        "**/*.png",
        "**/*.jp(e)?g",
        "**/*.gif",
        "**/*.webp",
        "**/*.woff",
        "**/*.woff2",
      ],
      limit: Infinity,
    }),
    json({ compact: production }),
    consts({ baseUrl: production ? "" : "http://localhost:4321" }),
    babel({
      babelHelpers: "bundled",
      extensions: [".js", ".mjs", ".html", ".svelte"],
    }),

    production && opt && compiler(),
    production && opt && terser({ compress: { passes: 3 } }),

    html({
      template: path.join(__dirname, "public/index.html"),
      inject: [
        {
          fileName: "index.js",
          inline: production,
          attrs: { type: "module" },
        },
        { fileName: "index.css", inline: production },
      ],
    }),

    // In dev mode, call `npm run serve` once
    // the bundle has been generated
    // eslint-disable-next-line no-use-before-define
    !production && serve(),

    // App.js will be built after bundle, so we only need to watch that.
    // By setting a small delay the Node server has a chance to restart before reloading.
    !production && livereload(),

    // If we're building for production (npm run build
    // instead of npm run start), minify
    production && opt && minifyHtml(),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      // eslint-disable-next-line global-require
      server = require("child_process").spawn(
        "npm",
        ["run", "serve", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        },
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}
