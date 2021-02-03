/* eslint-disable no-console */
export default function loggerPlugin() {
  return {
    name: 'logger-plugin',
    async generateBundle(options, bundle) {
      const entries = Object.entries(bundle);
      const mappedEntries = entries.map(
        ([k, { source, code, map, modules, ...v }]) => [k, v],
      );
      const obj = Object.fromEntries(mappedEntries);
      console.log(obj);
    },
  };
}
