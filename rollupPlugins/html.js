/* eslint-disable import/no-extraneous-dependencies */
import fs from "fs";
import path from "path";
import minimatch from "minimatch";
import { failIf, unixify } from "./util";

const configs = [
  {
    pattern: "**/*.js",
    typeName: "script",
    config: {
      standard: {
        position: "body",
        srcAttr: "src",
        tagName: "script",
        attrs: {},
        defaultAttrs: { type: "text/javascript" },
        hasClosingTag: true,
      },
      inline: {
        position: "body",
        srcAttr: "src",
        tagName: "script",
        attrs: {},
        defaultAttrs: { type: "text/javascript" },
        hasClosingTag: true,
      },
    },
  },
  {
    pattern: "**/*.css",
    typeName: "stylesheet",
    config: {
      standard: {
        position: "head",
        srcAttr: "href",
        tagName: "link",
        attrs: {},
        defaultAttrs: { rel: "stylesheet" },
        hasClosingTag: false,
      },
      inline: {
        position: "head",
        srcAttr: "href",
        tagName: "style",
        attrs: {},
        defaultAttrs: {},
        hasClosingTag: true,
      },
    },
  },
  {
    pattern: "**/manifest.json",
    typeName: "web app manifest",
    config: {
      standard: {
        position: "head",
        srcAttr: "href",
        tagName: "link",
        attrs: {},
        defaultAttrs: { rel: "manifest" },
        hasClosingTag: false,
      },
    },
  },
];

function createConfig(userConfig, fileName) {
  const foundConfig = configs.find(({ pattern }) =>
    minimatch(fileName, pattern),
  );
  failIf(
    !foundConfig,
    `Could not find configuration for "${fileName}". ` +
      "Only scripts, stylesheets and web app manifests are supported.",
  );
  let config;
  if (userConfig.inline) {
    const inlineConfig = foundConfig.config.inline;
    failIf(
      !inlineConfig,
      `Assests of type "${foundConfig.typeName}" cannot be inlined.`,
    );
    config = inlineConfig;
  } else {
    config = foundConfig.config.standard;
  }
  return { ...config, ...userConfig };
}

function findChunk(bundleEntries, fileName) {
  const foundEntry = bundleEntries.find(([chunkKey]) =>
    minimatch(chunkKey, path.join(fileName)),
  );
  failIf(!foundEntry, `Could not find asset "${fileName}".`);
  return foundEntry;
}

function createAttrs(config, chunkFileName, publicPath) {
  const newSrc = publicPath + unixify(chunkFileName);
  const sourceAttr = !config.inline
    ? { [config.srcAttr]: newSrc }
    : {};
  return Object.entries({
    ...sourceAttr,
    ...config.defaultAttrs,
    ...config.attrs,
  })
    .filter(([, value]) => value !== false)
    .map(([key, value]) => [key, value === true ? "" : value])
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

function createHtmlTag(config, attrs, source) {
  const startTag = `<${config.tagName} ${attrs}>`;
  const endTag = config.hasClosingTag ? `</${config.tagName}>` : "";
  const innerHtml = config.inline ? source : "";
  const mainTag = `${startTag}${innerHtml}${endTag}`;
  const noscriptStart = config.noscript ? "<noscript>" : "";
  const noscriptEnd = config.noscript ? "</noscript>" : "";
  const {
    start: customTagStart,
    end: customTagEnd,
  } = config.customSurroundingTags || {
    start: "",
    end: "",
  };
  return `${customTagStart}${noscriptStart}${mainTag}${noscriptEnd}${customTagEnd}`;
}

function addTagsToSource(htmlSource, tags) {
  const headEnd = htmlSource.indexOf("</head>");
  const bodyEnd = htmlSource.indexOf("</body>");
  const start = htmlSource.substring(0, headEnd);
  const mid = htmlSource.substring(headEnd, bodyEnd);
  const end = htmlSource.substring(bodyEnd, htmlSource.length);
  const headTags = tags.head.join("");
  const bodyTags = tags.body.join("");
  return start + headTags + mid + bodyTags + end;
}

export default function htmlPlugin({
  inject,
  keepInlinedAssets = false,
  template,
  templateFileName = "index.html",
  publicPath = "/",
}) {
  return {
    name: "html-plugin",
    async generateBundle(options, bundle) {
      const tags = { head: [], body: [] };
      const bundleEntries = Object.entries(bundle);

      inject.forEach(({ fileName, ...userConfig }) => {
        const config = createConfig(userConfig, fileName);
        const [chunkKey, chunk] = findChunk(bundleEntries, fileName);
        const attrs = createAttrs(config, chunk.fileName, publicPath);
        const htmlTag = createHtmlTag(
          config,
          attrs,
          chunk.code || chunk.source,
        );
        tags[config.position].push(htmlTag);

        if (config.inline && !keepInlinedAssets) {
          // eslint-disable-next-line no-param-reassign
          delete bundle[chunkKey];
        }
      });

      const htmlTemplate = fs.readFileSync(template, "utf-8");
      const processedSource = addTagsToSource(htmlTemplate, tags);

      this.emitFile({
        type: "asset",
        source: processedSource,
        fileName: templateFileName,
      });
    },
  };
}
