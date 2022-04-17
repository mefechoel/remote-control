/* eslint-disable import/no-extraneous-dependencies */
import path from "path";
import workerpool from "workerpool";
import { createFilter } from "./util";

function isAboveThreshold(source, threshold) {
  if (typeof source !== "string") {
    return false;
  }
  const fileSize = Buffer.byteLength(source, "utf-8");
  return fileSize > threshold;
}

export default function compPlugin({
  inculde = [
    "**/*.html",
    "**/*.css",
    "**/*.js",
    "**/*.svg",
    "**/*.txt",
    "**/*.json",
  ],
  threshold = 10240,
} = {}) {
  const isIncluded = createFilter(inculde);
  const pool = workerpool.pool(
    path.join(__dirname, "rollupPlugins", "compWorker.js"),
  );
  return {
    name: "comp-plugin",
    async generateBundle({ dir }, bundle) {
      const entries = Object.entries(bundle);
      const promises = [];
      for (const [key, { fileName, code, source }] of entries) {
        const sourceTxt = code || source;
        if (
          isIncluded(key) &&
          isAboveThreshold(sourceTxt, threshold)
        ) {
          const compress = () => {
            const compPromise = pool.proxy().then((worker) =>
              worker.compressArtifacts({
                dir,
                fileName,
                source: sourceTxt,
              }),
            );
            promises.push(compPromise);
          };
          compress();
        }
      }
      await Promise.all(promises).finally(() => pool.terminate());
    },
  };
}
