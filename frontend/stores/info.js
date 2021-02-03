import { writable } from "svelte/store";

const { set, subscribe } = writable(null);

let id = 1;

const info = {
  set(text) {
    // eslint-disable-next-line no-plusplus
    set({ text, id: id++ });
  },
  subscribe,
};

export default info;
