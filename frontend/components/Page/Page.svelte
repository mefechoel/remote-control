<script>
  import cx from "../../util/cx";
  import style from "./Page.module.css";

  export let active;
  export let firstPage = false;

  const initialActive = active;
  let hasChanged = false;

  $: if (active !== initialActive) {
    hasChanged = true;
  }
</script>

<div
  class={cx(
    style.page,
    !hasChanged && style.unchanged,
    firstPage && !hasChanged && style.initial,
    active && hasChanged && style.active,
    !active && hasChanged && style.inactive,
  )}
>
  <slot />
</div>
