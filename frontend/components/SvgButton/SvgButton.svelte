<script>
  import Svg from "../Icons/Svg.svelte";
  import Button from "../Button";
  import cx from "../../util/cx";
  import style from "./SvgButton.module.css";

  export let icon;
  export let info;
  let className = "";
  export { className as class };
</script>

<Button
  class={cx(style.button, className)}
  activeClass={style.active}
  {info}
  on:activate
>
  <Svg class={style.svg}>
    <svelte:component this={icon} />
  </Svg>
</Button>
