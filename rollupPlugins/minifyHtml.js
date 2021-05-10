/* eslint-disable import/no-extraneous-dependencies */
import { minify as minifyHtml } from "html-minifier-terser";

export default function htmlMinifyPlugin(
  minifierOptions = {
    removeComments: false,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true,
  },
) {
  return {
    name: "html-minify-plugin",
    async generateBundle(options, bundle) {
      Object.entries(bundle).forEach(([key, { source }]) => {
        if (key.endsWith(".html")) {
          const minifiedSource = minifyHtml(source, minifierOptions);
          // eslint-disable-next-line no-param-reassign
          bundle[key].source = minifiedSource;
        }
      });
    },
  };
}
