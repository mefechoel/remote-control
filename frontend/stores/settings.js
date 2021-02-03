import { writable } from "svelte/store";
import themes from "../components/Settings/themes";

const STORAGE_KEY = "remote-settings";

export const defaultSettings = {
  refreshRate: 50,
  clickDuration: 50,
  infoPressDuration: 600,
  infoDisplayDuration: 3000,
  theme: themes.Insurance,
  themeName: "Insurance",
};
const initialValue = JSON.parse(localStorage.getItem(STORAGE_KEY));

const { set, subscribe } = writable(initialValue || defaultSettings);

const settings = {
  set(value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    set(value);
  },
  subscribe,
};

export default settings;
