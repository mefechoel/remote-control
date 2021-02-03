<script>
  import { writable } from "svelte/store";
  import SvgButton from "../SvgButton";
  import { ClearCache } from "../Icons";
  import RangeInput from "../RangeInput";
  import settings, { defaultSettings } from "../../stores/settings";
  import themes from "./themes";
  import style from "./Settings.module.css";

  const options = Object.keys(themes);

  const selectedTheme = writable($settings.themeName);
  selectedTheme.subscribe((nextTheme) => {
    if ($settings.themeName !== nextTheme) {
      settings.set({
        ...$settings,
        theme: themes[nextTheme],
        themeName: nextTheme,
      });
    }
  });

  const handleClear = () => {
    window.localStorage.clear();
    settings.set(defaultSettings);
    selectedTheme.set($settings.themeName);
  };
</script>

<div class={style.settings}>
  <select bind:value={$selectedTheme} class={style.select}>
    {#each options as theme (theme)}
      <option value={theme}>{theme}</option>
    {/each}
  </select>
  <RangeInput
    label="Randraduis"
    min={0}
    max={65}
    step={1}
    bind:value={$settings.theme.borderRadius}
  />
  <RangeInput
    label="Randdicke"
    min={1}
    max={15}
    step={1}
    bind:value={$settings.theme.borderWidth}
  />
  <details class={style.details}>
    <summary class={style.description}>
      Erweiterte Einstellungen
    </summary>
    <RangeInput
      label="Maus Frequenz"
      min={10}
      max={300}
      step={10}
      bind:value={$settings.refreshRate}
    />
    <RangeInput
      label="Klickdauer"
      min={10}
      max={300}
      step={10}
      bind:value={$settings.clickDuration}
    />
    <RangeInput
      label="Info-Klickdauer"
      min={300}
      max={1500}
      step={50}
      bind:value={$settings.infoPressDuration}
    />
    <RangeInput
      label="Info-Anzeigedauer"
      min={1000}
      max={10000}
      step={500}
      bind:value={$settings.infoDisplayDuration}
    />
  </details>
  <SvgButton
    class={style.resetButton}
    info="Auf Standardwerte zurücksetzen"
    icon={ClearCache}
    on:activate={handleClear}
  />
</div>
