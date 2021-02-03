<script>
  import { createEventDispatcher } from "svelte";
  import settings from "../../stores/settings";
  import infoStore from "../../stores/info";
  import isMobile from "../isMobile";
  import cx from "../../util/cx";
  import style from "./Button.module.css";

  export let info;
  export let activeClass = "";
  let className = "";
  export { className as class };

  const dispatch = createEventDispatcher();

  let infoShown = false;
  let infoTimeout = 0;
  let isPressed = false;

  const handleDown = () => {
    isPressed = true;
    infoTimeout = setTimeout(() => {
      infoStore.set(info);
      infoShown = true;
    }, $settings.infoPressDuration);
  };

  const handleUp = () => {
    isPressed = false;
    if (!infoShown) {
      clearTimeout(infoTimeout);
      dispatch("activate");
    }
    infoShown = false;
  };

  const noop = () => {};
</script>

<button
  class={cx(style.button, isPressed && activeClass, className)}
  on:mousedown={isMobile ? noop : handleDown}
  on:mouseup={isMobile ? noop : handleUp}
  on:touchstart={isMobile ? handleDown : noop}
  on:touchend={isMobile ? handleUp : noop}
>
  <slot />
</button>
