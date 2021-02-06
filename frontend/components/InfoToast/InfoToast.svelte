<script>
  import { fly } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import info from "../../stores/info";
  import Svg from "../Icons/Svg.svelte";
  import { Help } from "../Icons";
  import settings from "../../stores/settings";
  import style from "./InfoToast.module.css";

  let display = false;
  let timeout = 0;

  $: if ($info && $info.text && $info.id) {
    display = true;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      display = false;
      info.set(null);
    }, $settings.infoDisplayDuration);
  }

  const transitionConfig = {
    y: -50,
    duration: 300,
    easing: cubicInOut,
    opacity: 0,
  };
</script>

{#if display}
  <div
    class={style.toastContainer}
    in:fly={transitionConfig}
    out:fly={transitionConfig}
  >
    <div class={style.toast}>
      <Svg class={style.toastIcon}><Help /></Svg>
      <div class={style.toastContent}>{$info && $info.text}</div>
    </div>
  </div>
{/if}
