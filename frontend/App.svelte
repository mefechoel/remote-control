<script>
  import { onMount } from "svelte";
  import {
    Mouse,
    Remote,
    Settings as SettingsIcon,
  } from "./components/Icons";
  import cssStyle from "./App.module.css";
  import Svg from "./components/Icons/Svg.svelte";
  import Controls from "./components/Controls";
  import Touchpad from "./components/Touchpad";
  import InfoToast from "./components/InfoToast";
  import Settings from "./components/Settings";
  import Button from "./components/Button";
  import cx from "./util/cx";
  import settings from "./stores/settings";

  const viewTypes = {
    CONTROLS: 0,
    MOUSE: 1,
    SETTINGS: 2,
  };

  const getPrevViewId = (viewId) => (viewId - 1 + 3) % 3;
  const getNextViewId = (viewId) => (viewId + 1) % 3;

  const viewInfo = {
    [getPrevViewId(
      viewTypes.CONTROLS,
    )]: "Zur Fernbedienungsfunktion wechseln",
    [getPrevViewId(viewTypes.MOUSE)]: "Zur Mausfunktion wechseln",
    [getPrevViewId(
      viewTypes.SETTINGS,
    )]: "Zu den Einstellungen wechseln",
  };

  let view = viewTypes.CONTROLS;
  let mounted = false;

  const handleChangeView = () => {
    view = getNextViewId(view);
  };

  onMount(() => {
    const varStyleTagCss = document.createElement("style");
    varStyleTagCss.dataset.varDef = 1;
    document.head.appendChild(varStyleTagCss);

    mounted = true;
  });

  $: if (mounted) {
    const varCss = Object.entries($settings.theme)
      .map(([key, value]) => {
        const formatted =
          typeof value === "number" ? `${value}px` : value;
        return `--${key}:${formatted};`;
      })
      .join("");
    const varStyleTagCss = document.querySelector("[data-var-def]");
    varStyleTagCss.innerHTML = `:root{${varCss}}`;
  }
</script>

<svelte:head>
  <meta name="theme-color" content={$settings.theme.themeCol} />
</svelte:head>

<main class={cssStyle.wrapper}>
  <InfoToast />
  {#if view === viewTypes.CONTROLS}
    <Controls />
  {/if}
  {#if view === viewTypes.MOUSE}
    <Touchpad />
  {/if}
  {#if view === viewTypes.SETTINGS}
    <Settings />
  {/if}
  <Button
    class={cx(cssStyle.viewSwitch, cssStyle.button)}
    activeClass={cssStyle.active}
    info={viewInfo[view]}
    on:activate={handleChangeView}
  >
    <Svg>
      {#if view === viewTypes.CONTROLS}
        <Mouse />
      {/if}
      {#if view === viewTypes.MOUSE}
        <SettingsIcon />
      {/if}
      {#if view === viewTypes.SETTINGS}
        <Remote />
      {/if}
    </Svg>
  </Button>
</main>
